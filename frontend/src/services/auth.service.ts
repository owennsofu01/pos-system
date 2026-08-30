import { api, unwrap } from "./api";
import { Staff } from "../types/domain";

export interface LoginResult {
  staff: Staff;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  login: (email: string, password: string) => unwrap<LoginResult>(api.post("/auth/login", { email, password })),
  refresh: (refreshToken: string) => unwrap<{ accessToken: string }>(api.post("/auth/refresh", { refreshToken })),
  me: () => unwrap<Staff>(api.get("/auth/me")),
  requestReset: (email: string) => unwrap<{ message: string }>(api.post("/auth/request-reset", { email }))
};
