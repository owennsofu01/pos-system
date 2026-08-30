import { channelRepository } from "../repositories/channelRepository";
import { AppError } from "../utils/AppError";
import { Channel, ChatMessage } from "../types/domain";

export const chatService = {
  list: (): Promise<Channel[]> => channelRepository.findAll(),

  async open(channelId: string): Promise<{ channel: Channel; messages: ChatMessage[] }> {
    const channel = await channelRepository.findById(channelId);
    if (!channel) throw AppError.notFound("Channel not found.");
    await channelRepository.markRead(channelId);
    const messages = await channelRepository.messagesFor(channelId);
    return { channel: { ...channel, unread: 0 }, messages };
  },

  async send(channelId: string, from: string, body: string): Promise<ChatMessage> {
    const text = body.trim();
    if (!text) throw AppError.badRequest("Message cannot be empty.");
    const channel = await channelRepository.findById(channelId);
    if (!channel) throw AppError.notFound("Channel not found.");
    return channelRepository.post(channelId, from, text);
  }
};
