import React, { useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { mockSongs, mockArtists } from '@/data/mockData';
import SongCard from '@/components/music/SongCard';
import ArtistCard from '@/components/music/ArtistCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredSongs = mockSongs.filter(
    song =>
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artistName.toLowerCase().includes(query.toLowerCase()) ||
      song.genre.toLowerCase().includes(query.toLowerCase())
  );

  const filteredArtists = mockArtists.filter(artist =>
    artist.displayName.toLowerCase().includes(query.toLowerCase())
  );

  const genres = [...new Set(mockSongs.map(song => song.genre))];

  return (
    <div className="p-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="relative max-w-xl">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search songs, artists, or genres..."
            className="h-14 pl-12 pr-12 text-lg bg-muted/50 border-muted focus-visible:ring-primary"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {query ? (
        /* Search Results */
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All ({filteredSongs.length + filteredArtists.length})
            </TabsTrigger>
            <TabsTrigger value="songs">Songs ({filteredSongs.length})</TabsTrigger>
            <TabsTrigger value="artists">Artists ({filteredArtists.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {filteredArtists.length > 0 && (
              <section className="mb-8">
                <h3 className="mb-4 text-lg font-semibold">Artists</h3>
                <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6">
                  {filteredArtists.slice(0, 6).map(artist => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </section>
            )}
            {filteredSongs.length > 0 && (
              <section>
                <h3 className="mb-4 text-lg font-semibold">Songs</h3>
                <div className="space-y-1">
                  {filteredSongs.map(song => (
                    <SongCard key={song.id} song={song} variant="row" queue={filteredSongs} />
                  ))}
                </div>
              </section>
            )}
            {filteredSongs.length === 0 && filteredArtists.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No results found for "{query}"</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="songs">
            <div className="space-y-1">
              {filteredSongs.map(song => (
                <SongCard key={song.id} song={song} variant="row" queue={filteredSongs} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="artists">
            <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6">
              {filteredArtists.map(artist => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        /* Browse by Genre */
        <div>
          <h2 className="mb-6 text-2xl font-bold">Browse by Genre</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {genres.map(genre => {
              const genreSongs = mockSongs.filter(s => s.genre === genre);
              const coverUrl = genreSongs[0]?.coverUrl;
              return (
                <button
                  key={genre}
                  onClick={() => setQuery(genre)}
                  className="group relative aspect-[2/1] overflow-hidden rounded-xl"
                >
                  <img
                    src={coverUrl}
                    alt={genre}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white">{genre}</h3>
                    <p className="text-sm text-white/70">{genreSongs.length} songs</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
