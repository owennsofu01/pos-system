import { settingsRepository } from "../repositories/settingsRepository";
import { EmailSettings, Settings } from "../types/domain";

export const settingsService = {
  get: (): Promise<Settings> => settingsRepository.get(),
  update: (data: Settings): Promise<Settings> => settingsRepository.update(data),
  getEmail: (): Promise<EmailSettings> => settingsRepository.getEmail(),
  updateEmail: (data: EmailSettings): Promise<EmailSettings> => settingsRepository.updateEmail(data)
};
