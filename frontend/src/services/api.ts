import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retried) {
      original._retried = true;
      refreshing ??= useAuthStore.getState().refreshAccessToken();
      const token = await refreshing;
      refreshing = null;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Every service module unwraps { success, data } / throws the API's message
// on failure, so components only ever deal with plain data or a thrown Error.
export async function unwrap<T>(promise: Promise<{ data: { success: boolean; data?: T; message?: string } }>): Promise<T> {
  const { data: body } = await promise;
  if (!body.success) throw new Error(body.message ?? "Request failed");
  return body.data as T;
}
