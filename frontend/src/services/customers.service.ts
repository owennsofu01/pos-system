import { api, unwrap } from "./api";
import { Customer } from "../types/domain";

export const customersService = {
  list: () => unwrap<Customer[]>(api.get("/customers")),
  create: (data: { name: string; phone: string; email: string }) => unwrap<Customer>(api.post("/customers", data)),
  remove: (id: number) => unwrap<null>(api.delete(`/customers/${id}`))
};
