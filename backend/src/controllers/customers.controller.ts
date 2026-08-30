import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { customerService } from "../services/customerService";

export const customerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().default(""),
  email: z.string().default("")
});

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await customerService.list() });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await customerService.create(req.body) });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await customerService.remove(Number(req.params.id));
  res.json({ success: true, data: null });
});
