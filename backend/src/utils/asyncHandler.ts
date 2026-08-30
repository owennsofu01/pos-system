import { NextFunction, Request, Response } from "express";

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Express doesn't forward rejected promises to error middleware on its own —
// this wrapper does, so every controller can just `await` and throw AppError.
export const asyncHandler = (fn: Handler) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res, next).catch(next);
};
