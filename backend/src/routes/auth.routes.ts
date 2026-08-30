import { Router } from "express";
import rateLimit from "express-rate-limit";
import { verifyToken } from "../middleware/verifyToken";
import { validateBody } from "../middleware/validate";
import * as auth from "../controllers/auth.controller";

const router = Router();

// Cheap brute-force guard on login without needing Redis (single-instance
// MVP scope — see backend/README notes on the Redis rate-limiter trade-off).
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

router.post("/login", loginLimiter, validateBody(auth.loginSchema), auth.login);
router.post("/refresh", validateBody(auth.refreshSchema), auth.refresh);
router.post("/request-reset", loginLimiter, validateBody(auth.resetRequestSchema), auth.requestPasswordReset);
router.get("/me", verifyToken, auth.me);

export default router;
