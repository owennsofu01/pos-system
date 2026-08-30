import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { requireRole } from "../middleware/requireRole";
import { validateBody } from "../middleware/validate";
import * as staff from "../controllers/staff.controller";

const router = Router();
router.use(verifyToken, requireRole("settings"));

router.get("/", staff.list);
router.post("/", validateBody(staff.staffSchema), staff.create);
router.delete("/:id", staff.remove);

export default router;
