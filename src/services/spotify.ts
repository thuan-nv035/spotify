import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const api = axios.create({
  baseURL: 'https://api.spotify.com/v1',
});

api.interceptors.request.use(async (config) => {
  const authStore = useAuthStore();
  
  if (authStore.expiresAt && Date.now() > authStore.expiresAt - 60000) {
    await authStore.refreshAccessToken();
  }
  
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  return config;
});

export const spotifyService = {
  getPlaylists: () => api.get('/me/playlists'),
  getPlaylist: (id: string) => api.get(`/playlists/${id}`),
  getTopTracks: () => api.get('/me/top/tracks'),
  getRecentlyPlayed: () => api.get('/me/player/recently-played'),
  getNewReleases: () => api.get('/browse/new-releases'),
  getPlaybackState: () => api.get('/me/player'),
  play: (uri?: string, contextUri?: string) => api.put('/me/player/play', {
    uris: uri ? [uri] : undefined,
    context_uri: contextUri
  }),
  pause: () => api.put('/me/player/pause'),
  next: () => api.post('/me/player/next'),
  previous: () => api.post('/me/player/previous'),
  seek: (positionMs: number) => api.put(`/me/player/seek?position_ms=${positionMs}`),
  setVolume: (volumePercent: number) => api.put(`/me/player/volume?volume_percent=${volumePercent}`),
};
