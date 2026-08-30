import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { requireRole } from "../middleware/requireRole";
import { validateBody } from "../middleware/validate";
import * as channels from "../controllers/channels.controller";

const router = Router();
router.use(verifyToken, requireRole("messages"));

router.get("/", channels.list);
router.get("/:id", channels.open);
router.post("/:id/messages", validateBody(channels.sendMessageSchema), channels.send);

export default router;
