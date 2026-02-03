import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import MainLayout from "@/components/layout/MainLayout";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import LibraryPage from "@/pages/LibraryPage";
import LikedSongsPage from "@/pages/LikedSongsPage";
import ProfilePage from "@/pages/ProfilePage";
import LoginPage from "@/pages/LoginPage";
import ArtistDashboard from "@/pages/ArtistDashboard";
import UploadMusicPage from "@/pages/UploadMusicPage";
import PlaylistPage from "@/pages/PlaylistPage";
import ArtistProfilePage from "@/pages/ArtistProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PlayerProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="library" element={<LibraryPage />} />
                <Route path="liked" element={<LikedSongsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="artist/:id" element={<ArtistProfilePage />} />
                <Route path="dashboard" element={<ArtistDashboard />} />
                <Route path="upload" element={<UploadMusicPage />} />
                <Route path="playlists" element={<LibraryPage />} />
                <Route path="playlists/:id" element={<PlaylistPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PlayerProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
