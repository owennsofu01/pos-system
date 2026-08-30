import nodemailer from "nodemailer";
import { EmailSettings } from "../types/domain";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface EmailResult {
  ok: boolean;
  message: string;
}

// Mirrors POS.email.send from the prototype: validates the address, requires
// a configured host, then actually attempts delivery via nodemailer. A
// failure to *reach* the SMTP host still returns a descriptive result rather
// than throwing, matching the prototype's non-fatal email UX.
export const emailService = {
  subjectFor(template: string, business: string, receiptId: string): string {
    return template.replace("{business}", business).replace("{receipt}", receiptId);
  },

  async send(config: EmailSettings, to: string, subject: string, body = ""): Promise<EmailResult> {
    if (!EMAIL_RE.test(to.trim())) return { ok: false, message: "That address does not look valid." };
    if (!config.host) return { ok: false, message: "Set an SMTP host in Settings first." };

    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.security === "SSL",
      requireTLS: config.security === "TLS",
      auth: config.username ? { user: config.username, pass: "" } : undefined,
      connectionTimeout: 4000
    });

    try {
      await transport.sendMail({ from: `"${config.fromName}" <${config.fromAddress}>`, replyTo: config.replyTo, to, subject, text: body || subject });
      return { ok: true, message: `Sent to ${to} from ${config.fromAddress} via ${config.host}:${config.port} (${config.security}).` };
    } catch (err) {
      return { ok: false, message: `Could not reach ${config.host}:${config.port} — ${(err as Error).message}` };
    }
  }
};
