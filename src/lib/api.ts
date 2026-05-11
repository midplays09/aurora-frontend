import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    // Auto-inject JWT token
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Handle 401 responses
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.token = null;
          // Emit event for auth store to handle
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

  // ─── Categories ────────────────────────────────────
  async getCategories() {
    const res = await this.client.get('/api/categories');
    return res.data.categories;
  }

  async createCategory(name: string) {
    const res = await this.client.post('/api/categories', { name });
    return res.data.category;
  }

  async updateCategory(id: string, name: string) {
    const res = await this.client.put(`/api/categories/${id}`, { name });
    return res.data.category;
  }

  async deleteCategory(id: string) {
    const res = await this.client.delete(`/api/categories/${id}`);
    return res.data;
  }

  // ─── Tracks ────────────────────────────────────────
  async getTracks(categoryId?: string) {
    const params = categoryId ? { category: categoryId } : {};
    const res = await this.client.get('/api/tracks', { params });
    return res.data.tracks;
  }

  async createTrack(data: {
    title: string;
    artist: string;
    album?: string;
    duration?: number;
    categoryId?: string | null;
  }) {
    const res = await this.client.post('/api/tracks', data);
    return res.data.track;
  }

  async updateTrack(id: string, data: Partial<{
    title: string;
    artist: string;
    album: string;
    duration: number;
  }>) {
    const res = await this.client.put(`/api/tracks/${id}`, data);
    return res.data.track;
  }

  async deleteTrack(id: string) {
    const res = await this.client.delete(`/api/tracks/${id}`);
    return res.data;
  }

  async assignTrackCategory(trackId: string, categoryId: string | null) {
    const res = await this.client.put(`/api/tracks/${trackId}/category`, { categoryId });
    return res.data.track;
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
