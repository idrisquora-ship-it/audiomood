import React, { useState } from 'react';
import { Settings, User, Music, Palette, Bell, Shield, Volume2, Type, Loader2, Plus, Trash2, LogOut, AlertTriangle } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SocialLink } from '@/hooks/useSettings';

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Japan', 'Brazil', 'India', 'Nigeria', 'South Africa', 'Other'
];

const SettingsPage: React.FC = () => {
  const { user, profile, isAuthenticated, isArtist, signOut, loading: authLoading } = useAuthContext();
  const { settings, loading: settingsLoading, updatePlaybackSettings, updateLyricsSettings, updateAppearanceSettings, updatePrivacySettings, updateProfileSettings } = useSettingsContext();
  const { preferences, updatePreferences } = useNotifications();
  const { toast } = useToast();

  const [bio, setBio] = useState(settings?.bio || '');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(settings?.social_links || []);
  const [country, setCountry] = useState(settings?.country || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  React.useEffect(() => {
    if (settings) {
      setBio(settings.bio || '');
      setSocialLinks(settings.social_links || []);
      setCountry(settings.country || '');
    }
  }, [settings]);

  if (authLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center p-8 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    await updateProfileSettings(bio || null, socialLinks, country || null);
    setSavingProfile(false);
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setResettingPassword(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    setResettingPassword(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Email Sent', description: 'Check your email for password reset instructions' });
    }
  };

  const handleDeleteAccount = async () => {
    toast({ title: 'Contact Support', description: 'Please contact support to delete your account' });
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        </div>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="playback" className="gap-2">
            <Volume2 className="h-4 w-4" />
            <span className="hidden sm:inline">Playback</span>
          </TabsTrigger>
          <TabsTrigger value="lyrics" className="gap-2">
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Lyrics</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input value={profile?.display_name || ''} disabled />
                <p className="text-xs text-muted-foreground">Edit from your profile page</p>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleResetPassword} disabled={resettingPassword}>
                  {resettingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Reset Password
                </Button>
                <Button variant="outline" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings (Artists) */}
          {isArtist && (
            <Card>
              <CardHeader>
                <CardTitle>Artist Profile</CardTitle>
                <CardDescription>Additional information shown on your artist profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell fans about yourself..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country / Region</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Social Links</Label>
                    <Button variant="outline" size="sm" onClick={addSocialLink}>
                      <Plus className="mr-1 h-4 w-4" /> Add Link
                    </Button>
                  </div>
                  {socialLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Platform (e.g., Twitter)"
                        value={link.platform}
                        onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                        className="w-1/3"
                      />
                      <Input
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeSocialLink(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button onClick={handleSaveProfile} disabled={savingProfile} className="gradient-primary">
                  {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. All your data, playlists, and uploaded music will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Playback Settings */}
        <TabsContent value="playback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Playback Settings</CardTitle>
              <CardDescription>Control how music plays</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Audio Quality</Label>
                  <p className="text-sm text-muted-foreground">Higher quality uses more data</p>
                </div>
                <Select
                  value={settings?.playback_settings.audio_quality || 'normal'}
                  onValueChange={(value: 'low' | 'normal' | 'high') => updatePlaybackSettings({ audio_quality: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Autoplay Next Song</Label>
                  <p className="text-sm text-muted-foreground">Automatically play the next song in queue</p>
                </div>
                <Switch
                  checked={settings?.playback_settings.autoplay_next ?? true}
                  onCheckedChange={(checked) => updatePlaybackSettings({ autoplay_next: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Crossfade Duration</Label>
                    <p className="text-sm text-muted-foreground">{settings?.playback_settings.crossfade_duration || 0} seconds</p>
                  </div>
                </div>
                <Slider
                  value={[settings?.playback_settings.crossfade_duration || 0]}
                  onValueChange={([value]) => updatePlaybackSettings({ crossfade_duration: value })}
                  max={12}
                  step={1}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Normalize Volume</Label>
                  <p className="text-sm text-muted-foreground">Set the same volume level for all songs</p>
                </div>
                <Switch
                  checked={settings?.playback_settings.normalize_volume ?? false}
                  onCheckedChange={(checked) => updatePlaybackSettings({ normalize_volume: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Explicit Content Filter</Label>
                  <p className="text-sm text-muted-foreground">Hide explicit songs from recommendations</p>
                </div>
                <Switch
                  checked={settings?.playback_settings.explicit_filter ?? false}
                  onCheckedChange={(checked) => updatePlaybackSettings({ explicit_filter: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lyrics Settings */}
        <TabsContent value="lyrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lyrics Preferences</CardTitle>
              <CardDescription>Customize how lyrics are displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Wrap Lyrics Text</Label>
                  <p className="text-sm text-muted-foreground">Allow lyrics to wrap naturally</p>
                </div>
                <Switch
                  checked={settings?.lyrics_settings.wrap_text ?? true}
                  onCheckedChange={(checked) => updateLyricsSettings({ wrap_text: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Font Size</Label>
                  <p className="text-sm text-muted-foreground">Size of lyrics text</p>
                </div>
                <Select
                  value={settings?.lyrics_settings.font_size || 'medium'}
                  onValueChange={(value: 'small' | 'medium' | 'large') => updateLyricsSettings({ font_size: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Line Spacing</Label>
                  <p className="text-sm text-muted-foreground">Space between lyric lines</p>
                </div>
                <Select
                  value={settings?.lyrics_settings.line_spacing || 'normal'}
                  onValueChange={(value: 'compact' | 'normal' | 'relaxed') => updateLyricsSettings({ line_spacing: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Scroll Lyrics</Label>
                  <p className="text-sm text-muted-foreground">Automatically scroll to current line</p>
                </div>
                <Switch
                  checked={settings?.lyrics_settings.auto_scroll ?? true}
                  onCheckedChange={(checked) => updateLyricsSettings({ auto_scroll: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Highlight Mode</Label>
                  <p className="text-sm text-muted-foreground">How active lyrics are highlighted</p>
                </div>
                <Select
                  value={settings?.lyrics_settings.highlight_mode || 'line'}
                  onValueChange={(value: 'line' | 'word') => updateLyricsSettings({ highlight_mode: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Highlight</SelectItem>
                    <SelectItem value="word">Karaoke Style</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look of Senoxa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme (default)</p>
                </div>
                <Switch
                  checked={settings?.appearance_settings.dark_mode ?? true}
                  onCheckedChange={(checked) => updateAppearanceSettings({ dark_mode: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Reduce Motion</Label>
                  <p className="text-sm text-muted-foreground">Minimize animations for accessibility</p>
                </div>
                <Switch
                  checked={settings?.appearance_settings.reduce_motion ?? false}
                  onCheckedChange={(checked) => updateAppearanceSettings({ reduce_motion: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Releases</Label>
                  <p className="text-sm text-muted-foreground">When artists you follow release new music</p>
                </div>
                <Switch
                  checked={preferences?.new_release ?? true}
                  onCheckedChange={(checked) => updatePreferences({ new_release: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Playlist Updates</Label>
                  <p className="text-sm text-muted-foreground">When playlists you follow are updated</p>
                </div>
                <Switch
                  checked={preferences?.playlist_updates ?? true}
                  onCheckedChange={(checked) => updatePreferences({ playlist_updates: checked })}
                />
              </div>

              {isArtist && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>New Followers</Label>
                      <p className="text-sm text-muted-foreground">When someone follows you</p>
                    </div>
                    <Switch
                      checked={preferences?.new_follower ?? true}
                      onCheckedChange={(checked) => updatePreferences({ new_follower: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Milestones</Label>
                      <p className="text-sm text-muted-foreground">Stream count milestones (1k, 10k, etc.)</p>
                    </div>
                    <Switch
                      checked={preferences?.milestones ?? true}
                      onCheckedChange={(checked) => updatePreferences({ milestones: checked })}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
              <CardDescription>Control your privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Listening History</Label>
                  <p className="text-sm text-muted-foreground">Let others see what you're listening to</p>
                </div>
                <Switch
                  checked={settings?.privacy_settings.listening_history_public ?? false}
                  onCheckedChange={(checked) => updatePrivacySettings({ listening_history_public: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Playlists by Default</Label>
                  <p className="text-sm text-muted-foreground">New playlists will be public</p>
                </div>
                <Switch
                  checked={settings?.privacy_settings.public_playlists ?? true}
                  onCheckedChange={(checked) => updatePrivacySettings({ public_playlists: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Analytics</Label>
                  <p className="text-sm text-muted-foreground">Help improve Senoxa with usage data</p>
                </div>
                <Switch
                  checked={settings?.privacy_settings.allow_analytics ?? true}
                  onCheckedChange={(checked) => updatePrivacySettings({ allow_analytics: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
