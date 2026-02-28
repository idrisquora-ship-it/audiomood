import React, { useState } from 'react';
import { Music, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const LoginPage: React.FC = () => {
  const { isAuthenticated, loading: authLoading, signIn, signUp, signInWithSpotify } = useAuthContext();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [displayName, setDisplayName] = useState(''); const [role, setRole] = useState<'listener' | 'artist'>('listener'); const [loading, setLoading] = useState(false); const [spotifyLoading, setSpotifyLoading] = useState(false);
  if (authLoading) { return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>; }
  if (isAuthenticated) { return <Navigate to="/" replace />; }
  const handleSignIn = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); await signIn(email, password); setLoading(false); };
  const handleSignUp = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); await signUp(email, password, displayName, role); setLoading(false); };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none"><div className="absolute -top-40 -right-40 h-60 md:h-80 w-60 md:w-80 rounded-full bg-primary/10 blur-3xl" /><div className="absolute -bottom-40 -left-40 h-60 md:h-80 w-60 md:w-80 rounded-full bg-accent/10 blur-3xl" /></div>
      <Card className="relative w-full max-w-md bg-background/80 backdrop-blur-lg border-border/50">
        <CardHeader className="text-center"><div className="mx-auto mb-3 md:mb-4 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent"><Music className="h-6 w-6 md:h-8 md:w-8 text-white" /></div><CardTitle className="text-xl md:text-2xl font-bold">Senoxa</CardTitle><CardDescription className="text-sm">Stream, create, and discover music</CardDescription></CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6"><TabsTrigger value="signin">Sign In</TabsTrigger><TabsTrigger value="signup">Sign Up</TabsTrigger></TabsList>
            <TabsContent value="signin"><form onSubmit={handleSignIn} className="space-y-4"><div className="space-y-2"><Label htmlFor="signin-email">Email</Label><Input id="signin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div><div className="space-y-2"><Label htmlFor="signin-password">Password</Label><Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /></div><Button type="submit" disabled={loading} className="w-full gradient-primary glow-primary">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}Sign In</Button><div className="relative my-2"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div></div><Button type="button" variant="outline" disabled={spotifyLoading} className="w-full" onClick={async () => { setSpotifyLoading(true); await signInWithSpotify(); setSpotifyLoading(false); }}>{spotifyLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>}Continue with Spotify</Button></form></TabsContent>
            <TabsContent value="signup"><form onSubmit={handleSignUp} className="space-y-4"><div className="space-y-2"><Label>Display Name</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" required /></div><div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div><div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required /></div><div className="space-y-3"><Label>I want to...</Label><RadioGroup value={role} onValueChange={(v) => setRole(v as 'listener' | 'artist')}><div className="flex items-center space-x-2 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50"><RadioGroupItem value="listener" id="listener" /><Label htmlFor="listener" className="flex-1 cursor-pointer"><span className="font-medium">Listen to music</span></Label></div><div className="flex items-center space-x-2 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50"><RadioGroupItem value="artist" id="artist" /><Label htmlFor="artist" className="flex-1 cursor-pointer"><span className="font-medium">Create and share music</span></Label></div></RadioGroup></div><Button type="submit" disabled={loading} className="w-full gradient-primary glow-primary">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}Create Account</Button></form></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
