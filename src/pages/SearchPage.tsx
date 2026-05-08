import React, { useState } from 'react';
import { Search, Music, UserCircle } from 'lucide-react';
import { useSongs, useArtists, Song } from '@/hooks/useSongs';
import SongCard from '@/components/music/SongCard';
import ArtistCard from '@/components/music/ArtistCard';
import AuthGate from '@/components/auth/AuthGate';
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

  const handleSearch = async (value: string) => { 
    setQuery(value); 
    if (value.trim().length < 2) { 
      setSearchResults([]); 
      setArtistResults([]); 
      return; 
    } 
    setLoading(true); 
    const [songs, artists] = await Promise.all([searchSongs(value), searchArtists(value)]); 
    setSearchResults(songs); 
    setArtistResults(artists); 
    setLoading(false); 
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const value = e.target.value; 
    setQuery(value); 
    setTimeout(() => handleSearch(value), 300); 
  };

  return (
    <AuthGate>
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="mb-4 text-2xl md:text-3xl font-bold">Search</h1>
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-muted-foreground" />
            <Input 
              value={query} 
              onChange={handleInputChange} 
              placeholder="Search for songs, artists..." 
              className="h-10 md:h-12 pl-10 md:pl-12 text-base md:text-lg" 
            />
          </div>
        </div>
        
        {query.length >= 2 && (
          <Tabs defaultValue="songs" className="w-full">
            <TabsList className="mb-4 md:mb-6 w-full justify-start">
              <TabsTrigger value="songs" className="flex-1 md:flex-none">
                Songs ({searchResults.length})
              </TabsTrigger>
              <TabsTrigger value="artists" className="flex-1 md:flex-none">
                Artists ({artistResults.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="songs">
              {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:gap-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-square rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:gap-4">
                  {searchResults.map(song => (
                    <SongCard key={song.id} song={song} queue={searchResults} showPlays />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 md:py-20">
                  <Music className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg md:text-xl font-semibold">No songs found</h3>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="artists">
              {loading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:gap-6">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-square rounded-full" />
                    </div>
                  ))}
                </div>
              ) : artistResults.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:gap-6">
                  {artistResults.map((artist: any) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 md:py-20">
                  <UserCircle className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg md:text-xl font-semibold">No artists found</h3>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        {query.length < 2 && (
          <div className="flex flex-col items-center justify-center py-16 md:py-20">
            <Search className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg md:text-xl font-semibold">Start searching</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Find your favorite songs and artists
            </p>
          </div>
        )}
      </div>
    </AuthGate>
  );
};

export default SearchPage;
