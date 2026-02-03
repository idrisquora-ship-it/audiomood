import React, { useState } from 'react';
import { Search, Music, UserCircle } from 'lucide-react';
import { useSongs, useArtists, Song } from '@/hooks/useSongs';
import SongCard from '@/components/music/SongCard';
import ArtistCard from '@/components/music/ArtistCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [artistResults, setArtistResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { searchSongs } = useSongs();
  const { searchArtists } = useArtists();

  const handleSearch = async (value: string) => { setQuery(value); if (value.trim().length < 2) { setSearchResults([]); setArtistResults([]); return; } setLoading(true); const [songs, artists] = await Promise.all([searchSongs(value), searchArtists(value)]); setSearchResults(songs); setArtistResults(artists); setLoading(false); };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { const value = e.target.value; setQuery(value); setTimeout(() => handleSearch(value), 300); };

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="mb-4 text-3xl font-bold">Search</h1><div className="relative"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={handleInputChange} placeholder="Search for songs, artists..." className="h-12 pl-12 text-lg" /></div></div>
      {query.length >= 2 && (
        <Tabs defaultValue="songs" className="w-full">
          <TabsList className="mb-6"><TabsTrigger value="songs">Songs ({searchResults.length})</TabsTrigger><TabsTrigger value="artists">Artists ({artistResults.length})</TabsTrigger></TabsList>
          <TabsContent value="songs">{loading ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{Array(6).fill(0).map((_, i) => <div key={i} className="space-y-3"><Skeleton className="aspect-square rounded-lg" /><Skeleton className="h-4 w-3/4" /></div>)}</div> : searchResults.length > 0 ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{searchResults.map(song => <SongCard key={song.id} song={song} queue={searchResults} showPlays />)}</div> : <div className="flex flex-col items-center justify-center py-20"><Music className="h-16 w-16 text-muted-foreground/50" /><h3 className="mt-4 text-xl font-semibold">No songs found</h3></div>}</TabsContent>
          <TabsContent value="artists">{loading ? <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{Array(6).fill(0).map((_, i) => <div key={i} className="space-y-3"><Skeleton className="aspect-square rounded-full" /></div>)}</div> : artistResults.length > 0 ? <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{artistResults.map((artist: any) => <ArtistCard key={artist.id} artist={artist} />)}</div> : <div className="flex flex-col items-center justify-center py-20"><UserCircle className="h-16 w-16 text-muted-foreground/50" /><h3 className="mt-4 text-xl font-semibold">No artists found</h3></div>}</TabsContent>
        </Tabs>
      )}
      {query.length < 2 && <div className="flex flex-col items-center justify-center py-20"><Search className="h-16 w-16 text-muted-foreground/50" /><h3 className="mt-4 text-xl font-semibold">Start searching</h3></div>}
    </div>
  );
};

export default SearchPage;
