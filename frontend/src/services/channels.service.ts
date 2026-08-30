import { api, unwrap } from "./api";
import { Channel, ChatMessage } from "../types/domain";

export const channelsService = {
  list: () => unwrap<Channel[]>(api.get("/channels")),
  open: (id: string) => unwrap<{ channel: Channel; messages: ChatMessage[] }>(api.get(`/channels/${id}`)),
  send: (id: string, body: string) => unwrap<ChatMessage>(api.post(`/channels/${id}/messages`, { body }))
};
