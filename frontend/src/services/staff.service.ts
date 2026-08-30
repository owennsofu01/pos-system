import { api, unwrap } from "./api";
import { Role, Staff } from "../types/domain";

export const staffService = {
  list: () => unwrap<Staff[]>(api.get("/staff")),
  create: (data: { name: string; email: string; role: Role }) => unwrap<Staff>(api.post("/staff", data)),
  remove: (id: number) => unwrap<null>(api.delete(`/staff/${id}`))
};
