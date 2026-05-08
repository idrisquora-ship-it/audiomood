import React, { useState, useRef } from 'react';
import { Upload, Music, Image, Loader2, FileText } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useUpload } from '@/hooks/useUpload';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';

const genres = ['Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Jazz', 'Classical', 'Country', 'Folk', 'Metal', 'Indie', 'Alternative', 'Other'];

const UploadMusicPage: React.FC = () => {
  const { isArtist, isAuthenticated, loading: authLoading } = useAuthContext();
  const { uploadSong, uploading, progress, generatingLyrics } = useUpload();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [artistNotes, setArtistNotes] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isArtist) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20">
        <Upload className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="mt-4 text-2xl font-bold">Upload Music</h2>
        <p className="mt-2 text-muted-foreground">Upgrade to artist to upload</p>
        <Button onClick={() => navigate('/profile')} className="mt-6 gradient-primary">
          Become an Artist
        </Button>
      </div>
    );
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !title || !genre) return;
    const song = await uploadSong(
      audioFile,
      coverFile,
      title,
      genre,
      isPublic,
      artistNotes || null
    );
    if (song) {
      navigate('/dashboard');
    }
  };

  const isValid = audioFile && title && genre;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload Music</h1>
        <p className="text-muted-foreground">Share your music with the world</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Audio File */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              Audio File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              ref={audioInputRef}
              onChange={handleAudioChange}
              accept="audio/*"
              className="hidden"
            />
            <div
              onClick={() => audioInputRef.current?.click()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 cursor-pointer hover:border-primary/50 transition-colors"
            >
              {audioFile ? (
                <>
                  <Music className="h-12 w-12 text-primary mb-4" />
                  <p className="font-medium">{audioFile.name}</p>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="font-medium">Click to upload audio</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cover Image */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Cover Image (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverChange}
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={() => coverInputRef.current?.click()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 cursor-pointer hover:border-primary/50 transition-colors"
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              ) : (
                <>
                  <Image className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="font-medium">Click to upload cover</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Song Details */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Song Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter song title"
              />
            </div>
            <div className="space-y-2">
              <Label>Genre</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Make Public</Label>
                <p className="text-sm text-muted-foreground">
                  Public songs will be visible to everyone
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </CardContent>
        </Card>

        {/* Artist Notes */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Artist Notes (Optional)
            </CardTitle>
            <CardDescription>
              Add a personal note about this song that will be displayed with the lyrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={artistNotes}
              onChange={(e) => setArtistNotes(e.target.value)}
              placeholder="Share the story behind this song, the inspiration, or a message to your listeners..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Upload Progress */}
        {uploading && (
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading audio...</span>
                    <span>{progress.audio}%</span>
                  </div>
                  <Progress value={progress.audio} />
                </div>
                {generatingLyrics && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating lyrics with AI...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          type="submit"
          disabled={!isValid || uploading}
          className="w-full gradient-primary glow-primary"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Song
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default UploadMusicPage;
