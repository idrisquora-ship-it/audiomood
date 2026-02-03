import { useState, useCallback, useEffect } from 'react';
import { Song } from '@/hooks/useSongs';
import { toast } from 'sonner';

const DB_NAME = 'senoxa-offline';
const DB_VERSION = 1;
const STORE_NAME = 'songs';

interface DownloadedSong extends Song {
  audioBlob: Blob;
  coverBlob?: Blob;
  downloadedAt: number;
}

export function useOfflineDownload() {
  const [downloadedSongs, setDownloadedSongs] = useState<DownloadedSong[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Open IndexedDB
  const openDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }, []);

  // Load downloaded songs from IndexedDB
  const loadDownloadedSongs = useCallback(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        setDownloadedSongs(request.result);
      };
    } catch (error) {
      console.error('Failed to load downloaded songs:', error);
    }
  }, [openDB]);

  // Download a song for offline use
  const downloadSong = useCallback(async (song: Song) => {
    if (downloading) {
      toast.error('A download is already in progress');
      return;
    }

    setDownloading(song.id);

    try {
      // Download audio file
      const audioResponse = await fetch(song.audio_url);
      if (!audioResponse.ok) throw new Error('Failed to download audio');
      const audioBlob = await audioResponse.blob();

      // Download cover image if exists
      let coverBlob: Blob | undefined;
      if (song.cover_url) {
        try {
          const coverResponse = await fetch(song.cover_url);
          if (coverResponse.ok) {
            coverBlob = await coverResponse.blob();
          }
        } catch (e) {
          console.warn('Failed to download cover:', e);
        }
      }

      // Save to IndexedDB
      const downloadedSong: DownloadedSong = {
        ...song,
        audioBlob,
        coverBlob,
        downloadedAt: Date.now(),
      };

      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.put(downloadedSong);

      transaction.oncomplete = () => {
        setDownloadedSongs((prev) => [...prev.filter((s) => s.id !== song.id), downloadedSong]);
        toast.success(`"${song.title}" downloaded for offline listening`);
      };

      transaction.onerror = () => {
        throw new Error('Failed to save to database');
      };
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download song');
    } finally {
      setDownloading(null);
    }
  }, [downloading, openDB]);

  // Remove a downloaded song
  const removeSong = useCallback(async (songId: string) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(songId);

      transaction.oncomplete = () => {
        setDownloadedSongs((prev) => prev.filter((s) => s.id !== songId));
        toast.success('Song removed from downloads');
      };
    } catch (error) {
      console.error('Failed to remove song:', error);
      toast.error('Failed to remove song');
    }
  }, [openDB]);

  // Check if a song is downloaded
  const isDownloaded = useCallback((songId: string) => {
    return downloadedSongs.some((s) => s.id === songId);
  }, [downloadedSongs]);

  // Get offline URL for a song
  const getOfflineUrl = useCallback((songId: string): string | null => {
    const song = downloadedSongs.find((s) => s.id === songId);
    if (song?.audioBlob) {
      return URL.createObjectURL(song.audioBlob);
    }
    return null;
  }, [downloadedSongs]);

  // Get offline cover URL
  const getOfflineCoverUrl = useCallback((songId: string): string | null => {
    const song = downloadedSongs.find((s) => s.id === songId);
    if (song?.coverBlob) {
      return URL.createObjectURL(song.coverBlob);
    }
    return null;
  }, [downloadedSongs]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('You are back online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info('You are offline. Only downloaded songs are available.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load songs on mount
  useEffect(() => {
    loadDownloadedSongs();
  }, [loadDownloadedSongs]);

  return {
    downloadedSongs,
    downloading,
    isOnline,
    downloadSong,
    removeSong,
    isDownloaded,
    getOfflineUrl,
    getOfflineCoverUrl,
  };
}
