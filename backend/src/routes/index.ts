import { Router } from "express";
import authRoutes from "./auth.routes";
import productsRoutes from "./products.routes";
import customersRoutes from "./customers.routes";
import transactionsRoutes from "./transactions.routes";
import inventoryRoutes from "./inventory.routes";
import reportsRoutes from "./reports.routes";
import settingsRoutes from "./settings.routes";
import staffRoutes from "./staff.routes";
import channelsRoutes from "./channels.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));

router.use("/auth", authRoutes);
router.use("/products", productsRoutes);
router.use("/customers", customersRoutes);
router.use("/transactions", transactionsRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/reports", reportsRoutes);
router.use("/settings", settingsRoutes);
router.use("/staff", staffRoutes);
router.use("/channels", channelsRoutes);

export default router;
