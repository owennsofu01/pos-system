import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { requireRole } from "../middleware/requireRole";
import { validateBody } from "../middleware/validate";
import * as inventory from "../controllers/inventory.controller";

const router = Router();
router.use(verifyToken, requireRole("inventory"));

router.get("/", inventory.rows);
router.get("/log", inventory.log);
router.post("/:id/adjust", validateBody(inventory.adjustSchema), inventory.adjust);

export default router;
