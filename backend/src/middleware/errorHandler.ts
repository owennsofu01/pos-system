import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { ApiFailure } from "../types/api";

// Last middleware in the chain — every asyncHandler rejection and every
// thrown AppError lands here so controllers never format error JSON themselves.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    const body: ApiFailure = { success: false, message: err.message, ...(err.field ? { field: err.field } : {}) };
    res.status(err.status).json(body);
    return;
  }
  console.error(err);
  const body: ApiFailure = { success: false, message: "Internal server error" };
  res.status(500).json(body);
}
