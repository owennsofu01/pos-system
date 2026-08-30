import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { requireAnyRole, requireRole } from "../middleware/requireRole";
import { validateBody } from "../middleware/validate";
import * as transactions from "../controllers/transactions.controller";

const router = Router();
router.use(verifyToken);

router.get("/", requireRole("transactions"), transactions.list);
router.get("/:id", requireAnyRole("transactions", "pos"), transactions.getOne);
router.post("/checkout", requireRole("pos"), validateBody(transactions.checkoutSchema), transactions.checkout);
router.post("/:id/refund", requireRole("transactions"), transactions.refund);

export default router;
