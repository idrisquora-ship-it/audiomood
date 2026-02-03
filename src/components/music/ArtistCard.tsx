import React from 'react';
import { UserCircle } from 'lucide-react';

interface Artist { id: string; display_name: string; avatar: string | null; }
interface ArtistCardProps { artist: Artist; }

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <div className="group text-center">
      <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full bg-muted">
        {artist.avatar ? <img src={artist.avatar} alt={artist.display_name} className="h-full w-full object-cover transition-transform group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center"><UserCircle className="h-16 w-16 text-muted-foreground" /></div>}
      </div>
      <p className="mt-3 truncate font-medium">{artist.display_name}</p>
      <p className="text-sm text-muted-foreground">Artist</p>
    </div>
  );
};

export default ArtistCard;
