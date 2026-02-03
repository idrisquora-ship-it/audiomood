import React, { createContext, useContext, ReactNode } from 'react';
import { useSettings, UserSettings, PlaybackSettings, LyricsSettings, AppearanceSettings, PrivacySettings, SocialLink } from '@/hooks/useSettings';

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  updatePlaybackSettings: (settings: Partial<PlaybackSettings>) => Promise<void>;
  updateLyricsSettings: (settings: Partial<LyricsSettings>) => Promise<void>;
  updateAppearanceSettings: (settings: Partial<AppearanceSettings>) => Promise<void>;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>;
  updateProfileSettings: (bio: string | null, socialLinks: SocialLink[], country: string | null) => Promise<void>;
  refetch: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const settingsData = useSettings();

  return (
    <SettingsContext.Provider value={settingsData}>
      {children}
    </SettingsContext.Provider>
  );
};
