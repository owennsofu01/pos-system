import { api, unwrap } from "./api";
import { DashboardReport, RangeReport } from "../types/domain";

export const reportsService = {
  dashboard: () => unwrap<DashboardReport>(api.get("/reports/dashboard")),
  range: (range: "Daily" | "Weekly" | "Monthly") => unwrap<RangeReport>(api.get("/reports/range", { params: { range } }))
};
