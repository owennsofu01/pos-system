import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { reportService } from "../services/reportService";
import { AppError } from "../utils/AppError";

export const dashboard = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await reportService.dashboard() });
});

const RANGES = ["Daily", "Weekly", "Monthly"] as const;

export const range = asyncHandler(async (req: Request, res: Response) => {
  const r = req.query.range as string;
  if (!RANGES.includes(r as any)) throw AppError.badRequest("range must be Daily, Weekly or Monthly");
  res.json({ success: true, data: await reportService.range(r as (typeof RANGES)[number]) });
});
