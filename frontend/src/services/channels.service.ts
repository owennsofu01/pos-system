import { api, unwrap } from "./api";
import { Channel, ChannelSummary, ChatMessage } from "../types/domain";

export const channelsService = {
  list: () => unwrap<ChannelSummary[]>(api.get("/channels")),
  open: (id: string) => unwrap<{ channel: Channel; messages: ChatMessage[] }>(api.get(`/channels/${id}`)),
  send: (id: string, body: string) => unwrap<ChatMessage>(api.post(`/channels/${id}/messages`, { body }))
};
