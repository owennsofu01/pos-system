import { api, unwrap } from "./api";
import { Product } from "../types/domain";

export const productsService = {
  list: () => unwrap<Product[]>(api.get("/products")),
  create: (data: Omit<Product, "id">) => unwrap<Product>(api.post("/products", data)),
  update: (id: number, data: Omit<Product, "id">) => unwrap<Product>(api.put(`/products/${id}`, data)),
  remove: (id: number) => unwrap<null>(api.delete(`/products/${id}`))
};
