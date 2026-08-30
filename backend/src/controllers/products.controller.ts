import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { productService } from "../services/productService";

export const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  price: z.coerce.number().min(0),
  cost: z.coerce.number().min(0),
  qty: z.coerce.number().int().min(0)
});

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await productService.list() });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await productService.create(req.body) });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await productService.update(Number(req.params.id), req.body) });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await productService.remove(Number(req.params.id));
  res.json({ success: true, data: null });
});
