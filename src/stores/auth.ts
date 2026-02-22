import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('spotify_access_token') || null,
    refreshToken: localStorage.getItem('spotify_refresh_token') || null,
    expiresAt: Number(localStorage.getItem('spotify_expires_at')) || 0,
    user: null as any,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken && state.expiresAt > Date.now(),
  },
  actions: {
    setTokens(tokens: { access_token: string; refresh_token: string; expires_in: number }) {
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
      this.expiresAt = Date.now() + tokens.expires_in * 1000;

      localStorage.setItem('spotify_access_token', this.accessToken);
      localStorage.setItem('spotify_refresh_token', this.refreshToken);
      localStorage.setItem('spotify_expires_at', String(this.expiresAt));
      
      this.fetchUser();
    },
    async fetchUser() {
      if (!this.accessToken) return;
      try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        });
        this.user = response.data;
      } catch (error) {
        console.error('Failed to fetch user:', error);
        if ((error as any).response?.status === 401) {
          this.refreshAccessToken();
        }
      }
    },
    async refreshAccessToken() {
      if (!this.refreshToken) return;
      try {
        const response = await axios.post('/api/auth/refresh', {
          refresh_token: this.refreshToken
        });
        const { access_token, expires_in } = response.data;
        this.accessToken = access_token;
        this.expiresAt = Date.now() + expires_in * 1000;
        localStorage.setItem('spotify_access_token', this.accessToken);
        localStorage.setItem('spotify_expires_at', String(this.expiresAt));
      } catch (error) {
        this.logout();
      }
    },
    logout() {
      this.accessToken = null;
      this.refreshToken = null;
      this.expiresAt = 0;
      this.user = null;
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      localStorage.removeItem('spotify_expires_at');
    }
  }
});
