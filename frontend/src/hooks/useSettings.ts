import { useEffect, useState } from "react";
import { settingsService } from "../services/settings.service";
import { Settings } from "../types/domain";

const FALLBACK: Settings = {
  businessName: "Meridian Supply", businessType: "Retail", taxRate: 8.5, currency: "USD",
  lowStockThreshold: 6, pointsPerUnit: 1, receiptFooter: ""
};

// Business config is read by nearly every screen (money formatting, tax rate,
// low-stock threshold) — this hook fetches it once and lets any screen refetch
// after Settings saves a change.
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(FALLBACK);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    settingsService.get().then(setSettings).finally(() => setLoading(false));
  };

  useEffect(reload, []);

  return { settings, loading, reload };
}
