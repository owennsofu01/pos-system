import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { requireAnyRole } from "../middleware/requireRole";
import * as reports from "../controllers/reports.controller";

const router = Router();
router.use(verifyToken);

router.get("/dashboard", requireAnyRole("dashboard"), reports.dashboard);
router.get("/range", requireAnyRole("reports"), reports.range);

export default router;
