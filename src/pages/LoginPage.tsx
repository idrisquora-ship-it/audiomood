import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, User as UserIcon } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@/types/music';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const LoginPage: React.FC = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('listener');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setError('Please enter a display name');
      return;
    }

    login(displayName.trim(), selectedRole);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <Card className="relative w-full max-w-md border-muted bg-card/50 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
            <Music className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome to Senoxa</CardTitle>
          <CardDescription>
            Sign in to discover and share music
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={e => {
                  setDisplayName(e.target.value);
                  setError('');
                }}
                placeholder="Enter your name"
                className="bg-muted/50"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="space-y-3">
              <Label>I am a...</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('listener')}
                  className={cn(
                    'flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all',
                    selectedRole === 'listener'
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-muted-foreground/50'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full',
                      selectedRole === 'listener'
                        ? 'gradient-primary'
                        : 'bg-muted'
                    )}
                  >
                    <UserIcon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Listener</p>
                    <p className="text-xs text-muted-foreground">
                      Discover & enjoy music
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('artist')}
                  className={cn(
                    'flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all',
                    selectedRole === 'artist'
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-muted-foreground/50'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full',
                      selectedRole === 'artist'
                        ? 'gradient-primary'
                        : 'bg-muted'
                    )}
                  >
                    <Music className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Artist</p>
                    <p className="text-xs text-muted-foreground">
                      Share your music
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full gradient-primary text-white">
              Get Started
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
