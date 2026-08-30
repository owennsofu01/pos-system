import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { ROLE_SCREENS, Screen } from "../types/roles";

// Enforces the same role -> screen access map the frontend nav uses, so an
// API call can't reach a screen's data even if a client bypasses the UI.
export function requireRole(screen: Screen) {
  return requireAnyRole(screen);
}

// Some reads (e.g. the product catalog) are needed by more than one screen —
// the POS grid and the Products table both list products, but only "products"
// implies edit rights. Route-level gating checks the union of screens instead
// of forcing every read behind a single screen key.
export function requireAnyRole(...screens: Screen[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized());
      return;
    }
    const allowed = ROLE_SCREENS[req.user.role];
    if (!screens.some(s => allowed.includes(s))) {
      next(AppError.forbidden(`Role "${req.user.role}" cannot access ${screens.join("/")}`));
      return;
    }
    next();
  };
}
