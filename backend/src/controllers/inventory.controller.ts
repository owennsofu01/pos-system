import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { inventoryService } from "../services/inventoryService";

export const adjustSchema = z.object({
  delta: z.number().int().refine(n => n !== 0, "Delta must not be zero")
});

export const rows = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await inventoryService.rows() });
});

export const log = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await inventoryService.log(20) });
});

export const adjust = asyncHandler(async (req: Request, res: Response) => {
  const { delta } = req.body as z.infer<typeof adjustSchema>;
  await inventoryService.adjust(Number(req.params.id), delta);
  res.json({ success: true, data: null });
});
