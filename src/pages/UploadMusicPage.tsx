import React, { useState } from 'react';
import { Upload, Music, Image, X, Check } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const genres = [
  'Electronic',
  'Ambient',
  'Synthwave',
  'Chillwave',
  'Lo-Fi',
  'Pop',
  'Rock',
  'Hip Hop',
  'R&B',
  'Jazz',
];

const UploadMusicPage: React.FC = () => {
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

    if (!title || !genre || !audioFile) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);

    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success('Track uploaded successfully!', {
      description: `"${title}" is now live on Senoxa`,
    });

    // Reset form
    setTitle('');
    setGenre('');
    setAudioFile(null);
    setCoverFile(null);
    setCoverPreview(null);
    setIsUploading(false);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload Music</h1>
        <p className="text-muted-foreground">
          Share your music with the world
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Audio Upload */}
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-primary" />
                Audio File
              </CardTitle>
              <CardDescription>
                Upload your track (MP3, WAV, FLAC)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {audioFile ? (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Music className="h-10 w-10 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{audioFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setAudioFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-muted rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div className="text-center">
                    <p className="font-medium">Drop your audio file here</p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={e => setAudioFile(e.target.files?.[0] || null)}
                  />
                </label>
              )}
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                Cover Image
              </CardTitle>
              <CardDescription>
                Add album artwork (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                {coverPreview ? (
                  <div className="relative">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="h-32 w-32 rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -right-2 -top-2 h-6 w-6"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex h-32 w-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted cursor-pointer hover:border-primary/50 transition-colors">
                    <Image className="h-8 w-8 text-muted-foreground" />
                    <span className="mt-2 text-xs text-muted-foreground">
                      Add cover
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverChange}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Track Details */}
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Track Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter track title"
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre *</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map(g => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isUploading || !audioFile || !title || !genre}
            className="w-full gradient-primary glow-primary h-12 text-lg"
          >
            {isUploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Upload Track
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadMusicPage;
