import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircle } from 'lucide-react';

interface Artist { id: string; display_name: string; avatar: string | null; }
interface ArtistCardProps { artist: Artist; }

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <Link to={`/artist/${artist.id}`} className="group block text-center">
      <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full bg-muted transition-transform group-hover:scale-105">
        {artist.avatar ? (
          <img 
            src={artist.avatar} 
            alt={artist.display_name} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserCircle className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>
      <p className="mt-3 truncate font-medium group-hover:text-primary transition-colors">
        {artist.display_name}
      </p>
      <p className="text-sm text-muted-foreground">Artist</p>
    </Link>
  );
};

export default ArtistCard;
