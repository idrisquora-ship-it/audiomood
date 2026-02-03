import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Song } from '@/types/music';

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole;
  likedSongs: string[];
  recentlyPlayed: string[];
  followedArtists: string[];
  login: (displayName: string, role: UserRole) => void;
  logout: () => void;
  upgradeToArtist: () => void;
  toggleLikeSong: (songId: string) => void;
  addToRecentlyPlayed: (songId: string) => void;
  toggleFollowArtist: (artistId: string) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const STORAGE_KEYS = {
  user: 'senoxa_user',
  likedSongs: 'senoxa_liked_songs',
  recentlyPlayed: 'senoxa_recently_played',
  followedArtists: 'senoxa_followed_artists',
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.user);
    return stored ? JSON.parse(stored) : null;
  });

  const [likedSongs, setLikedSongs] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.likedSongs);
    return stored ? JSON.parse(stored) : [];
  });

  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.recentlyPlayed);
    return stored ? JSON.parse(stored) : [];
  });

  const [followedArtists, setFollowedArtists] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.followedArtists);
    return stored ? JSON.parse(stored) : [];
  });

  // Persist to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.likedSongs, JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.recentlyPlayed, JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.followedArtists, JSON.stringify(followedArtists));
  }, [followedArtists]);

  const login = (displayName: string, role: UserRole) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      displayName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`,
      role,
      createdAt: new Date(),
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    setLikedSongs([]);
    setRecentlyPlayed([]);
    setFollowedArtists([]);
  };

  const upgradeToArtist = () => {
    if (user) {
      setUser({ ...user, role: 'artist' });
    }
  };

  const toggleLikeSong = (songId: string) => {
    setLikedSongs(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const addToRecentlyPlayed = (songId: string) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(id => id !== songId);
      return [songId, ...filtered].slice(0, 20);
    });
  };

  const toggleFollowArtist = (artistId: string) => {
    setFollowedArtists(prev =>
      prev.includes(artistId)
        ? prev.filter(id => id !== artistId)
        : [...prev, artistId]
    );
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role || 'listener',
        likedSongs,
        recentlyPlayed,
        followedArtists,
        login,
        logout,
        upgradeToArtist,
        toggleLikeSong,
        addToRecentlyPlayed,
        toggleFollowArtist,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
