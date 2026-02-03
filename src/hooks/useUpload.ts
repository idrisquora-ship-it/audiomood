import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UploadProgress {
  audio: number;
  cover: number;
}

export function useUpload() {
  const { profile, isArtist } = useAuthContext();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ audio: 0, cover: 0 });
  const [generatingLyrics, setGeneratingLyrics] = useState(false);
  const { toast } = useToast();

  const uploadSong = async (
    audioFile: File,
    coverFile: File | null,
    title: string,
    genre: string,
    isPublic: boolean = true,
    artistNotes: string | null = null
  ) => {
    if (!profile || !isArtist) {
      toast({
        title: 'Not authorized',
        description: 'Only artists can upload music',
        variant: 'destructive',
      });
      return null;
    }

    setUploading(true);
    setProgress({ audio: 0, cover: 0 });

    try {
      // Upload audio file
      const audioPath = `${profile.user_id}/${Date.now()}-${audioFile.name}`;
      const { data: audioData, error: audioError } = await supabase.storage
        .from('audio_files')
        .upload(audioPath, audioFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (audioError) throw audioError;
      setProgress(p => ({ ...p, audio: 100 }));

      const { data: { publicUrl: audioUrl } } = supabase.storage
        .from('audio_files')
        .getPublicUrl(audioPath);

      // Upload cover image if provided
      let coverUrl = null;
      if (coverFile) {
        const coverPath = `${profile.user_id}/${Date.now()}-${coverFile.name}`;
        const { data: coverData, error: coverError } = await supabase.storage
          .from('cover_images')
          .upload(coverPath, coverFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (coverError) throw coverError;
        setProgress(p => ({ ...p, cover: 100 }));

        const { data: { publicUrl } } = supabase.storage
          .from('cover_images')
          .getPublicUrl(coverPath);
        coverUrl = publicUrl;
      }

      // Get audio duration
      const duration = await getAudioDuration(audioFile);

      // Create song record
      const { data: song, error: songError } = await supabase
        .from('songs')
        .insert({
          artist_id: profile.id,
          title,
          audio_url: audioUrl,
          cover_url: coverUrl,
          duration,
          genre,
          is_public: isPublic,
          artist_notes: artistNotes,
        })
        .select()
        .single();

      if (songError) throw songError;

      // Create empty lyrics record
      const { error: lyricsError } = await supabase
        .from('lyrics')
        .insert({
          song_id: song.id,
          lyrics_json: { lines: [] },
        });

      if (lyricsError) {
        console.error('Error creating lyrics record:', lyricsError);
      }

      // Generate lyrics using ElevenLabs
      setGeneratingLyrics(true);
      try {
        const response = await fetch(
          `https://icqjadkcarpgayjtercn.supabase.co/functions/v1/generate-lyrics`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
            body: JSON.stringify({
              songId: song.id,
              audioUrl: audioUrl,
              title,
            }),
          }
        );

        const result = await response.json();
        if (result.success) {
          toast({
            title: 'Lyrics generated!',
            description: `${result.linesCount} lines of lyrics were transcribed`,
          });
        }
      } catch (lyricsGenError) {
        console.error('Error generating lyrics:', lyricsGenError);
        // Don't fail the upload if lyrics generation fails
      }
      setGeneratingLyrics(false);

      // Trigger notification for followers (fire and forget)
      try {
        await fetch(
          `https://icqjadkcarpgayjtercn.supabase.co/functions/v1/create-notification`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
            body: JSON.stringify({
              type: 'new_song',
              data: {
                artist_id: profile.id,
                song_id: song.id,
                song_title: title,
                artist_name: profile.display_name,
              },
            }),
          }
        );
      } catch (notifError) {
        console.error('Error sending notifications:', notifError);
      }

      toast({
        title: 'Upload successful!',
        description: `"${title}" has been uploaded`,
      });

      return song;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
      setGeneratingLyrics(false);
    }
  };

  const deleteSong = async (songId: string) => {
    if (!profile) return false;

    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId)
      .eq('artist_id', profile.id);

    if (error) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Song deleted',
      description: 'Your song has been removed',
    });
    return true;
  };

  const updateSong = async (
    songId: string,
    updates: { title?: string; genre?: string; is_public?: boolean }
  ) => {
    if (!profile) return false;

    const { error } = await supabase
      .from('songs')
      .update(updates)
      .eq('id', songId)
      .eq('artist_id', profile.id);

    if (error) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Song updated',
      description: 'Your changes have been saved',
    });
    return true;
  };

  return {
    uploadSong,
    deleteSong,
    updateSong,
    uploading,
    progress,
    generatingLyrics,
  };
}

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      resolve(Math.round(audio.duration));
    };
    audio.onerror = reject;
    audio.src = URL.createObjectURL(file);
  });
}
