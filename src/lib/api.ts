import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aurora-backend-production-e575.up.railway.app';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.token = null;
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:expired'));
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  // ─── Auth ──────────────────────────────────────────
  async register(email: string, password: string) {
    const res = await this.client.post('/api/register', { email, password });
    return res.data;
  }

  async login(email: string, password: string) {
    const res = await this.client.post('/api/login', { username: email, password });
    if (res.data.token) {
      this.setToken(res.data.token);
    }
    return res.data;
  }

  async getMe() {
    const res = await this.client.get('/api/me');
    return res.data;
  }

  // ─── YouTube Search ────────────────────────────────
  async searchYouTube(query: string, maxResults = 20) {
    const res = await this.client.get('/api/youtube/search', {
      params: { q: query, maxResults },
    });
    return res.data.results;
  }

  async getVideoDetails(videoId: string) {
    const res = await this.client.get(`/api/youtube/video/${videoId}`);
    return res.data;
  }

  // ─── Playlists ─────────────────────────────────────
  async getPlaylists() {
    const res = await this.client.get('/api/playlists');
    return res.data.playlists;
  }

  async createPlaylist(name: string) {
    const res = await this.client.post('/api/playlists', { name });
    return res.data.playlist;
  }

  async updatePlaylist(id: string, data: { name?: string; trackIds?: string[] }) {
    const res = await this.client.put(`/api/playlists/${id}`, data);
    return res.data.playlist;
  }

  async deletePlaylist(id: string) {
    const res = await this.client.delete(`/api/playlists/${id}`);
    return res.data;
  }

  async addTrackToPlaylist(playlistId: string, videoId: string) {
    const res = await this.client.post(`/api/playlists/${playlistId}/tracks`, { videoId });
    return res.data.playlist;
  }

  async removeTrackFromPlaylist(playlistId: string, videoId: string) {
    const res = await this.client.delete(`/api/playlists/${playlistId}/tracks/${videoId}`);
    return res.data.playlist;
  }

  // ─── Favorites ─────────────────────────────────────
  async getFavorites() {
    const res = await this.client.get('/api/favorites');
    return res.data.favorites;
  }

  async addFavorite(track: { videoId: string; title: string; channelName: string; thumbnail: string; duration: number }) {
    const res = await this.client.post('/api/favorites', track);
    return res.data;
  }

  async removeFavorite(videoId: string) {
    const res = await this.client.delete(`/api/favorites/${videoId}`);
    return res.data;
  }

  async checkFavorite(videoId: string) {
    const res = await this.client.get(`/api/favorites/check/${videoId}`);
    return res.data.isFavorited;
  }

  // ─── Comments ──────────────────────────────────────
  async getComments(videoId: string) {
    const res = await this.client.get(`/api/comments/${videoId}`);
    return res.data.comments;
  }

  async addComment(videoId: string, text: string) {
    const res = await this.client.post('/api/comments', { videoId, text });
    return res.data.comment;
  }

  async deleteComment(id: string) {
    const res = await this.client.delete(`/api/comments/${id}`);
    return res.data;
  }

  // ─── Track Stats ───────────────────────────────────
  async recordView(videoId: string, watchTimeSeconds: number) {
    const res = await this.client.post('/api/stats/view', { videoId, watchTimeSeconds });
    return res.data;
  }

  async getTrackStats(videoId: string) {
    const res = await this.client.get(`/api/stats/${videoId}`);
    return res.data;
  }

  // ─── Radio ─────────────────────────────────────────
  async getRadioStations(country: string, limit = 50, search = '') {
    const res = await this.client.get('/api/radio/stations', {
      params: { country, limit, search },
    });
    return res.data.stations;
  }

  async getRadioCountries() {
    const res = await this.client.get('/api/radio/countries');
    return res.data.countries;
  }
}

export const api = new ApiClient();
export default api;
