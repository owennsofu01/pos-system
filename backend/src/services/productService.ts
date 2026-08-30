import { productRepository } from "../repositories/productRepository";
import { AppError } from "../utils/AppError";
import { Product } from "../types/domain";

export const productService = {
  list: (): Promise<Product[]> => productRepository.findAll(),

  async create(data: Omit<Product, "id">): Promise<Product> {
    if (!data.name.trim()) throw AppError.badRequest("A product needs a name.", "name");
    if (data.price < 0 || data.cost < 0) throw AppError.badRequest("Price and cost cannot be negative.", "price");
    return productRepository.create(data);
  },

  async update(id: number, data: Omit<Product, "id">): Promise<Product> {
    const existing = await productRepository.findById(id);
    if (!existing) throw AppError.notFound("Product not found.");
    if (!data.name.trim()) throw AppError.badRequest("A product needs a name.", "name");
    if (data.price < 0 || data.cost < 0) throw AppError.badRequest("Price and cost cannot be negative.", "price");
    await productRepository.update(id, data);
    return { id, ...data };
  },

  remove: (id: number): Promise<void> => productRepository.remove(id)
};
