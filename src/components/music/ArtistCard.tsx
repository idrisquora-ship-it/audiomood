import React from 'react';
import { User } from '@/types/music';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ArtistCardProps {
  artist: User;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const { followedArtists, toggleFollowArtist } = useUser();
  const isFollowing = followedArtists.includes(artist.id);

  return (
    <div className="group text-center">
      <Link to={`/artist/${artist.id}`}>
        <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-full bg-muted">
          <img
            src={artist.avatar}
            alt={artist.displayName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 rounded-full ring-2 ring-transparent transition-all group-hover:ring-primary/50" />
        </div>
      </Link>
      <div className="mt-4">
        <Link to={`/artist/${artist.id}`}>
          <h4 className="font-medium hover:underline">{artist.displayName}</h4>
        </Link>
        <p className="text-sm text-muted-foreground">Artist</p>
        <Button
          variant={isFollowing ? 'outline' : 'default'}
          size="sm"
          onClick={() => toggleFollowArtist(artist.id)}
          className={cn(
            'mt-3',
            !isFollowing && 'gradient-primary border-0'
          )}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>
    </div>
  );
};

export default ArtistCard;
