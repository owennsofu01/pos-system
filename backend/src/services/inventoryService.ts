import { inventoryRepository } from "../repositories/inventoryRepository";
import { productRepository } from "../repositories/productRepository";
import { AppError } from "../utils/AppError";
import { InventoryLogEntry, Product } from "../types/domain";
import { settingsRepository } from "../repositories/settingsRepository";

export const inventoryService = {
  async rows(): Promise<{ products: Product[]; lowStockThreshold: number }> {
    const [products, settings] = await Promise.all([productRepository.findAll(), settingsRepository.get()]);
    return { products, lowStockThreshold: settings.lowStockThreshold };
  },

  log: (limit = 20): Promise<InventoryLogEntry[]> => inventoryRepository.recent(limit),

  async adjust(productId: number, delta: number): Promise<void> {
    const product = await productRepository.findById(productId);
    if (!product) throw AppError.notFound("Product not found.");
    if (delta < 0 && product.qty === 0) return;
    await inventoryRepository.adjustSingle(productId, delta, product.name);
  }
};
