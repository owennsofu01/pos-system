import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { Role } from "../types/roles";

export interface AuthPayload {
  id: number;
  role: Role;
  name: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function verifyToken(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(AppError.unauthorized("No token provided"));
    return;
  }
  try {
    const payload = jwt.verify(header.slice("Bearer ".length), env.jwt.accessSecret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired token"));
  }
}
