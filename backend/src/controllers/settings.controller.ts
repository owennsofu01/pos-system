import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { settingsService } from "../services/settingsService";
import { emailService } from "../services/emailService";

export const settingsSchema = z.object({
  businessName: z.string().min(1),
  businessType: z.string().min(1),
  taxRate: z.coerce.number().min(0).max(100),
  currency: z.string().length(3),
  lowStockThreshold: z.coerce.number().int().min(0),
  pointsPerUnit: z.coerce.number().min(0),
  receiptFooter: z.string().default("")
});

export const emailSettingsSchema = z.object({
  fromName: z.string().min(1),
  fromAddress: z.string().email(),
  replyTo: z.string().email(),
  host: z.string().default(""),
  port: z.coerce.number().int().min(1).max(65535),
  username: z.string().default(""),
  security: z.enum(["None", "TLS", "SSL"]),
  subjectTemplate: z.string().min(1),
  autoSend: z.boolean()
});

export const testEmailSchema = z.object({ to: z.string().email().optional() });
export const receiptEmailSchema = z.object({ to: z.string().email(), receiptId: z.string(), businessName: z.string() });

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await settingsService.get() });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await settingsService.update(req.body) });
});

export const getEmailSettings = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await settingsService.getEmail() });
});

export const updateEmailSettings = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await settingsService.updateEmail(req.body) });
});

export const sendTestEmail = asyncHandler(async (req: Request, res: Response) => {
  const cfg = await settingsService.getEmail();
  const to = (req.body as z.infer<typeof testEmailSchema>).to || cfg.replyTo;
  const result = await emailService.send(cfg, to, "Test message from the terminal");
  res.json({ success: true, data: result });
});

export const sendReceiptEmail = asyncHandler(async (req: Request, res: Response) => {
  const { to, receiptId, businessName } = req.body as z.infer<typeof receiptEmailSchema>;
  const cfg = await settingsService.getEmail();
  const subject = emailService.subjectFor(cfg.subjectTemplate, businessName, receiptId);
  const result = await emailService.send(cfg, to, subject);
  res.json({ success: true, data: result });
});
