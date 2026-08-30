import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Staff } from "../types/domain";
import { AuthPayload } from "../middleware/verifyToken";

export const generateAccessToken = (staff: Staff): string =>
  jwt.sign({ id: staff.id, role: staff.role, name: staff.name } satisfies AuthPayload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessTtl as any
  });

export const generateRefreshToken = (staff: Staff): string =>
  jwt.sign({ id: staff.id }, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshTtl as any });

export const verifyRefreshToken = (token: string): { id: number } =>
  jwt.verify(token, env.jwt.refreshSecret) as { id: number };
