import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { requireAnyRole } from "../middleware/requireRole";
import { validateBody } from "../middleware/validate";
import * as customers from "../controllers/customers.controller";

const router = Router();
router.use(verifyToken);

router.get("/", requireAnyRole("customers", "pos"), customers.list);
router.post("/", requireAnyRole("customers"), validateBody(customers.customerSchema), customers.create);
router.delete("/:id", requireAnyRole("customers"), customers.remove);

export default router;
