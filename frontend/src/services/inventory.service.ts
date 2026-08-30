import { api, unwrap } from "./api";
import { InventoryLogEntry, Product } from "../types/domain";

export const inventoryService = {
  rows: () => unwrap<{ products: Product[]; lowStockThreshold: number }>(api.get("/inventory")),
  log: () => unwrap<InventoryLogEntry[]>(api.get("/inventory/log")),
  adjust: (id: number, delta: number) => unwrap<null>(api.post(`/inventory/${id}/adjust`, { delta }))
};
