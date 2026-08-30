import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { transactionService } from "../services/transactionService";
import { AppError } from "../utils/AppError";

export const checkoutSchema = z.object({
  lines: z.array(z.object({
    productId: z.number().int().positive().nullable(),
    name: z.string().optional(),
    unitPrice: z.number().optional(),
    qty: z.number().int().positive()
  })).min(1),
  discountInput: z.string().default(""),
  method: z.enum(["cash", "card", "mobile_money"]),
  tendered: z.number().optional(),
  customerId: z.number().int().positive().nullable().default(null)
});

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await transactionService.list() });
});

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as z.infer<typeof checkoutSchema>;
  const data = await transactionService.checkout({ ...input, cashierId: req.user!.id, cashierName: req.user!.name });
  res.status(201).json({ success: true, data });
});

export const refund = asyncHandler(async (req: Request, res: Response) => {
  const data = await transactionService.refund(Number(req.params.id));
  res.json({ success: true, data });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const tx = await transactionService.get(Number(req.params.id));
  if (!tx) throw AppError.notFound("Transaction not found.");
  res.json({ success: true, data: tx });
});
