import { MusicServiceEnum } from "@shared/schema";

interface MusicServiceConfig {
  name: string;
  icon: string;
  color: string;
  authUrl: string;
  apiBaseUrl: string;
}

export const MUSIC_SERVICE_CONFIGS: Record<string, MusicServiceConfig> = {
  spotify: {
    name: "Spotify",
    icon: "spotify",
    color: "#1DB954", // Spotify green
    authUrl: "https://accounts.spotify.com/authorize",
    apiBaseUrl: "https://api.spotify.com/v1"
  },
  apple_music: {
    name: "Apple Music",
    icon: "apple",
    color: "#FC3C44", // Apple Music red
    authUrl: "https://appleid.apple.com/auth/authorize",
    apiBaseUrl: "https://api.music.apple.com/v1"
  },
  youtube_music: {
    name: "YouTube Music",
    icon: "youtube",
    color: "#FF0000", // YouTube red
    authUrl: "https://accounts.google.com/o/oauth2/auth",
    apiBaseUrl: "https://www.googleapis.com/youtube/v3"
  },
  other: {
    name: "Other",
    icon: "music",
    color: "#8A70D6", // App primary color
    authUrl: "",
    apiBaseUrl: ""
  }
};

export const getServiceColor = (service: string): string => {
  return MUSIC_SERVICE_CONFIGS[service]?.color || MUSIC_SERVICE_CONFIGS.other.color;
};

export const getServiceName = (service: string): string => {
  return MUSIC_SERVICE_CONFIGS[service]?.name || "Other";
};

// This is a mock function for demonstration purposes
// In a real app, this would use the actual API of the music service
export async function searchTrack(service: string, query: string) {
  // Mock search results
  const mockResults = [
    {
      id: "1",
      title: "Midnight City",
      artist: "M83",
      album: "Hurry Up, We're Dreaming",
      albumCover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=120&h=120&fit=crop",
      trackUrl: "https://example.com/track1"
    },
    {
      id: "2",
      title: "Higher Power",
      artist: "Coldplay",
      album: "Music Of The Spheres",
      albumCover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop",
      trackUrl: "https://example.com/track2"
    },
    {
      id: "3",
      title: "Lunar Waves",
      artist: "NightDrift",
      album: "Cosmic Journeys",
      albumCover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=120&h=120&fit=crop",
      trackUrl: "https://example.com/track3"
    }
  ];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter results based on query
  if (!query) return [];
  
  return mockResults.filter(track => 
    track.title.toLowerCase().includes(query.toLowerCase()) ||
    track.artist.toLowerCase().includes(query.toLowerCase()) ||
    track.album.toLowerCase().includes(query.toLowerCase())
  );
}

// This is a mock function for demonstration purposes
export function getNowPlaying(service: string, userId: number) {
  // In a real app, this would query the music service API
  return {
    isPlaying: Math.random() > 0.5,
    track: {
      title: "Midnight City",
      artist: "M83",
      album: "Hurry Up, We're Dreaming",
      albumCover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=120&h=120&fit=crop"
    }
  };
}
