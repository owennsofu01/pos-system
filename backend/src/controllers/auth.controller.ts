import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { authService } from "../services/authService";
import { staffRepository } from "../repositories/staffRepository";
import { AppError } from "../utils/AppError";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

export const resetRequestSchema = z.object({
  email: z.string().email()
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;
  const result = await authService.login(email, password);
  res.json({ success: true, data: result });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as z.infer<typeof refreshSchema>;
  const result = await authService.refresh(refreshToken);
  res.json({ success: true, data: result });
});

export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as z.infer<typeof resetRequestSchema>;
  res.json({ success: true, data: await authService.requestPasswordReset(email) });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const staff = await staffRepository.findById(req.user!.id);
  if (!staff) throw AppError.unauthorized("Account no longer exists");
  res.json({ success: true, data: staff });
});
