import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { staffService } from "../services/staffService";

export const staffSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "manager", "cashier", "viewer"])
});

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await staffService.list() });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, role } = req.body as z.infer<typeof staffSchema>;
  res.status(201).json({ success: true, data: await staffService.create(name, email, role) });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await staffService.remove(Number(req.params.id));
  res.json({ success: true, data: null });
});
