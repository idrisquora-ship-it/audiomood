import React from 'react';
import { Music, Lock, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';

interface AuthGateProps {
  children: React.ReactNode;
  message?: string;
}

const AuthGate: React.FC<AuthGateProps> = ({ 
  children, 
  message = 'Sign in to listen to music and discover new artists' 
}) => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
            <Music className="h-12 w-12 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <h2 className="mb-2 text-2xl font-bold">Welcome to Senoxa</h2>
        <p className="mb-6 max-w-md text-muted-foreground">{message}</p>
        
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/login">
            <Button className="gradient-primary glow-primary">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 grid max-w-lg grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-2xl font-bold text-primary">∞</p>
            <p className="text-xs text-muted-foreground">Unlimited Streaming</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-2xl font-bold text-primary">HD</p>
            <p className="text-xs text-muted-foreground">High Quality Audio</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-2xl font-bold text-primary">🎵</p>
            <p className="text-xs text-muted-foreground">Offline Downloads</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGate;
