import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { requireAnyRole, requireRole } from "../middleware/requireRole";
import { validateBody } from "../middleware/validate";
import * as products from "../controllers/products.controller";

const router = Router();
router.use(verifyToken);

// The POS grid needs the catalog too, not just the Products admin screen.
router.get("/", requireAnyRole("pos", "products"), products.list);
router.post("/", requireRole("products"), validateBody(products.productSchema), products.create);
router.put("/:id", requireRole("products"), validateBody(products.productSchema), products.update);
router.delete("/:id", requireRole("products"), products.remove);

export default router;
