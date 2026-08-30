import { RowDataPacket } from "mysql2";
import { pool } from "../config/db";
import { Channel, ChannelKind, ChatMessage } from "../types/domain";

interface ChannelRow extends RowDataPacket {
  id: string; name: string; kind: ChannelKind; member_count: number; unread: number;
}
interface MessageRow extends RowDataPacket {
  id: number; channel_id: string; from_name: string; body: string; occurred_at: string;
}

const toChannel = (r: ChannelRow): Channel => ({ id: r.id, name: r.name, kind: r.kind, memberCount: r.member_count, unread: r.unread });
const toMessage = (r: MessageRow): ChatMessage => ({ id: r.id, channelId: r.channel_id, from: r.from_name, body: r.body, occurredAt: r.occurred_at });

export const channelRepository = {
  async findAll(): Promise<Channel[]> {
    const [rows] = await pool.query<ChannelRow[]>("SELECT id, name, kind, member_count, unread FROM channels ORDER BY kind ASC, name ASC");
    return rows.map(toChannel);
  },

  async findById(id: string): Promise<Channel | null> {
    const [rows] = await pool.query<ChannelRow[]>("SELECT id, name, kind, member_count, unread FROM channels WHERE id = ? LIMIT 1", [id]);
    return rows[0] ? toChannel(rows[0]) : null;
  },

  async messagesFor(channelId: string): Promise<ChatMessage[]> {
    const [rows] = await pool.query<MessageRow[]>(
      "SELECT id, channel_id, from_name, body, occurred_at FROM messages WHERE channel_id = ? ORDER BY occurred_at ASC, id ASC",
      [channelId]
    );
    return rows.map(toMessage);
  },

  async post(channelId: string, from: string, body: string): Promise<ChatMessage> {
    const [res]: any = await pool.query(
      "INSERT INTO messages (channel_id, from_name, body) VALUES (?, ?, ?)",
      [channelId, from, body]
    );
    const [rows] = await pool.query<MessageRow[]>("SELECT id, channel_id, from_name, body, occurred_at FROM messages WHERE id = ?", [res.insertId]);
    return toMessage(rows[0]);
  },

  async markRead(channelId: string): Promise<void> {
    await pool.query("UPDATE channels SET unread = 0 WHERE id = ?", [channelId]);
  }
};
