import { customerRepository } from "../repositories/customerRepository";
import { Customer } from "../types/domain";

export const customerService = {
  list: (): Promise<Customer[]> => customerRepository.findAll(),
  create: (data: { name: string; phone: string; email: string }): Promise<Customer> => customerRepository.create(data),
  remove: (id: number): Promise<void> => customerRepository.remove(id)
};
