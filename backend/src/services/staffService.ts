import bcrypt from "bcrypt";
import { staffRepository } from "../repositories/staffRepository";
import { AppError } from "../utils/AppError";
import { Role } from "../types/roles";
import { Staff } from "../types/domain";

// Staff accounts created from Settings start with this shared onboarding
// password; the account holder is expected to change it after first sign-in.
// (A dedicated "invite" email flow is out of scope for this MVP.)
const DEFAULT_PASSWORD = "welcome-2026";

export const staffService = {
  list: (): Promise<Staff[]> => staffRepository.findAll(),

  async create(name: string, email: string, role: Role): Promise<Staff> {
    const existing = await staffRepository.findByEmail(email);
    if (existing) throw AppError.conflict("A staff account with that email already exists.");
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    return staffRepository.create(name, email, passwordHash, role);
  },

  remove: (id: number): Promise<void> => staffRepository.remove(id)
};
