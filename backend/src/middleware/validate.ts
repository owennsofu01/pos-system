import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { AppError } from "../utils/AppError";

// Parses req.body against a zod schema and replaces it with the parsed
// (and thus typed + defaulted) value. Every write route uses this — nothing
// touches req.body unvalidated.
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issue = result.error.issues[0];
      next(AppError.badRequest(issue?.message ?? "Invalid request body", issue?.path.join(".")));
      return;
    }
    req.body = result.data;
    next();
  };
}
