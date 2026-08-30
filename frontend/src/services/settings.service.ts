import { api, unwrap } from "./api";
import { EmailSettings, Settings } from "../types/domain";

export const settingsService = {
  get: () => unwrap<Settings>(api.get("/settings")),
  update: (data: Settings) => unwrap<Settings>(api.put("/settings", data)),
  getEmail: () => unwrap<EmailSettings>(api.get("/settings/email")),
  updateEmail: (data: EmailSettings) => unwrap<EmailSettings>(api.put("/settings/email", data)),
  sendTest: (to?: string) => unwrap<{ ok: boolean; message: string }>(api.post("/settings/email/test", { to })),
  sendReceipt: (to: string, receiptId: string, businessName: string) =>
    unwrap<{ ok: boolean; message: string }>(api.post("/settings/receipt-email", { to, receiptId, businessName }))
};
