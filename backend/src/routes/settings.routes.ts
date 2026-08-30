import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { requireRole } from "../middleware/requireRole";
import { validateBody } from "../middleware/validate";
import * as settings from "../controllers/settings.controller";

const router = Router();

// Business config (tax rate, currency, receipt footer) is read by nearly
// every screen — checkout math, money formatting, and the Sign-in screen's
// business name/branding before a session exists — so GET is public, not
// behind verifyToken. Only editing is gated (auth + the Settings screen).
router.get("/", settings.getSettings);
router.put("/", verifyToken, requireRole("settings"), validateBody(settings.settingsSchema), settings.updateSettings);

router.get("/email", verifyToken, requireRole("settings"), settings.getEmailSettings);
router.put("/email", verifyToken, requireRole("settings"), validateBody(settings.emailSettingsSchema), settings.updateEmailSettings);
router.post("/email/test", verifyToken, requireRole("settings"), validateBody(settings.testEmailSchema), settings.sendTestEmail);

router.post("/receipt-email", verifyToken, requireRole("pos"), validateBody(settings.receiptEmailSchema), settings.sendReceiptEmail);

export default router;
