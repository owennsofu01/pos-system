import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { requireRole } from "../middleware/requireRole";
import { validateBody } from "../middleware/validate";
import * as settings from "../controllers/settings.controller";

const router = Router();
router.use(verifyToken);

// Business config (tax rate, currency, receipt footer) is read by nearly
// every screen — checkout math, money formatting — so GET is open to any
// authenticated role; only editing is gated to the Settings screen.
router.get("/", settings.getSettings);
router.put("/", requireRole("settings"), validateBody(settings.settingsSchema), settings.updateSettings);

router.get("/email", requireRole("settings"), settings.getEmailSettings);
router.put("/email", requireRole("settings"), validateBody(settings.emailSettingsSchema), settings.updateEmailSettings);
router.post("/email/test", requireRole("settings"), validateBody(settings.testEmailSchema), settings.sendTestEmail);

router.post("/receipt-email", requireRole("pos"), validateBody(settings.receiptEmailSchema), settings.sendReceiptEmail);

export default router;
