import bcrypt from "bcrypt";
import { staffRepository } from "../repositories/staffRepository";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/tokens";
import { AppError } from "../utils/AppError";
import { Staff } from "../types/domain";
import { emailService } from "./emailService";
import { settingsRepository } from "../repositories/settingsRepository";

export const authService = {
  async login(email: string, password: string): Promise<{ staff: Staff; accessToken: string; refreshToken: string }> {
    const staff = await staffRepository.findByEmail(email);
    if (!staff || !(await bcrypt.compare(password, staff.passwordHash))) {
      throw AppError.unauthorized("Invalid email or password");
    }
    const { passwordHash: _drop, ...publicStaff } = staff;
    return {
      staff: publicStaff,
      accessToken: generateAccessToken(publicStaff),
      refreshToken: generateRefreshToken(publicStaff)
    };
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: { id: number };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw AppError.unauthorized("Invalid or expired refresh token");
    }
    const staff = await staffRepository.findById(payload.id);
    if (!staff) throw AppError.unauthorized("Account no longer exists");
    return { accessToken: generateAccessToken(staff) };
  },

  // Doesn't issue an actual reset token / change-password link (out of scope
  // for this MVP) — mirrors the prototype's non-committal UX by attempting a
  // real send through the configured SMTP settings and reporting the result.
  // Always returns the same generic wording regardless of whether the email
  // matches an account, so this endpoint can't be used to enumerate staff.
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const staff = await staffRepository.findByEmail(email);
    const cfg = await settingsRepository.getEmail();
    if (staff) {
      await emailService.send(cfg, email, "Reset your POS terminal password", "A password reset was requested for this account.");
    }
    return { message: `If ${email} has an account, a reset link was sent from ${cfg.fromAddress}. It expires in 30 minutes.` };
  }
};
