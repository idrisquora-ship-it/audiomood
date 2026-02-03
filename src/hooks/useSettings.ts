import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface PlaybackSettings {
  audio_quality: 'low' | 'normal' | 'high';
  autoplay_next: boolean;
  crossfade_duration: number;
  normalize_volume: boolean;
  explicit_filter: boolean;
}

export interface LyricsSettings {
  wrap_text: boolean;
  font_size: 'small' | 'medium' | 'large';
  line_spacing: 'compact' | 'normal' | 'relaxed';
  auto_scroll: boolean;
  highlight_mode: 'line' | 'word';
}

export interface AppearanceSettings {
  dark_mode: boolean;
  reduce_motion: boolean;
}

export interface PrivacySettings {
  listening_history_public: boolean;
  public_playlists: boolean;
  allow_analytics: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  playback_settings: PlaybackSettings;
  lyrics_settings: LyricsSettings;
  appearance_settings: AppearanceSettings;
  privacy_settings: PrivacySettings;
  bio: string | null;
  social_links: SocialLink[];
  country: string | null;
  created_at: string;
  updated_at: string;
}

const defaultPlaybackSettings: PlaybackSettings = {
  audio_quality: 'normal',
  autoplay_next: true,
  crossfade_duration: 0,
  normalize_volume: false,
  explicit_filter: false,
};

const defaultLyricsSettings: LyricsSettings = {
  wrap_text: true,
  font_size: 'medium',
  line_spacing: 'normal',
  auto_scroll: true,
  highlight_mode: 'line',
};

const defaultAppearanceSettings: AppearanceSettings = {
  dark_mode: true,
  reduce_motion: false,
};

const defaultPrivacySettings: PrivacySettings = {
  listening_history_public: false,
  public_playlists: true,
  allow_analytics: true,
};

export function useSettings() {
  const { user, isAuthenticated } = useAuthContext();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error);
    }

    if (data) {
      setSettings({
        ...data,
        playback_settings: data.playback_settings as unknown as PlaybackSettings,
        lyrics_settings: data.lyrics_settings as unknown as LyricsSettings,
        appearance_settings: data.appearance_settings as unknown as AppearanceSettings,
        privacy_settings: data.privacy_settings as unknown as PrivacySettings,
        social_links: (data.social_links as unknown as SocialLink[]) || [],
      });
    } else {
      // Create default settings for user
      const { data: newData, error: insertError } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          playback_settings: defaultPlaybackSettings as unknown as Json,
          lyrics_settings: defaultLyricsSettings as unknown as Json,
          appearance_settings: defaultAppearanceSettings as unknown as Json,
          privacy_settings: defaultPrivacySettings as unknown as Json,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating settings:', insertError);
      } else if (newData) {
        setSettings({
          ...newData,
          playback_settings: newData.playback_settings as unknown as PlaybackSettings,
          lyrics_settings: newData.lyrics_settings as unknown as LyricsSettings,
          appearance_settings: newData.appearance_settings as unknown as AppearanceSettings,
          privacy_settings: newData.privacy_settings as unknown as PrivacySettings,
          social_links: (newData.social_links as unknown as SocialLink[]) || [],
        });
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updatePlaybackSettings = async (newSettings: Partial<PlaybackSettings>) => {
    if (!settings || !user) return;

    const updated = { ...settings.playback_settings, ...newSettings };
    const { error } = await supabase
      .from('user_settings')
      .update({ playback_settings: updated as unknown as Json })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update settings', variant: 'destructive' });
    } else {
      setSettings({ ...settings, playback_settings: updated });
    }
  };

  const updateLyricsSettings = async (newSettings: Partial<LyricsSettings>) => {
    if (!settings || !user) return;

    const updated = { ...settings.lyrics_settings, ...newSettings };
    const { error } = await supabase
      .from('user_settings')
      .update({ lyrics_settings: updated as unknown as Json })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update settings', variant: 'destructive' });
    } else {
      setSettings({ ...settings, lyrics_settings: updated });
    }
  };

  const updateAppearanceSettings = async (newSettings: Partial<AppearanceSettings>) => {
    if (!settings || !user) return;

    const updated = { ...settings.appearance_settings, ...newSettings };
    const { error } = await supabase
      .from('user_settings')
      .update({ appearance_settings: updated as unknown as Json })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update settings', variant: 'destructive' });
    } else {
      setSettings({ ...settings, appearance_settings: updated });
    }
  };

  const updatePrivacySettings = async (newSettings: Partial<PrivacySettings>) => {
    if (!settings || !user) return;

    const updated = { ...settings.privacy_settings, ...newSettings };
    const { error } = await supabase
      .from('user_settings')
      .update({ privacy_settings: updated as unknown as Json })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update settings', variant: 'destructive' });
    } else {
      setSettings({ ...settings, privacy_settings: updated });
    }
  };

  const updateProfileSettings = async (bio: string | null, socialLinks: SocialLink[], country: string | null) => {
    if (!settings || !user) return;

    const { error } = await supabase
      .from('user_settings')
      .update({
        bio,
        social_links: socialLinks as unknown as Json,
        country,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update profile settings', variant: 'destructive' });
    } else {
      setSettings({ ...settings, bio, social_links: socialLinks, country });
      toast({ title: 'Success', description: 'Profile settings updated' });
    }
  };

  return {
    settings,
    loading,
    updatePlaybackSettings,
    updateLyricsSettings,
    updateAppearanceSettings,
    updatePrivacySettings,
    updateProfileSettings,
    refetch: fetchSettings,
  };
}
