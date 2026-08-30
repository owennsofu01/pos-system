import { FormEvent, useEffect, useState } from "react";
import { ChannelSummary, ChatMessage } from "../types/domain";
import { channelsService } from "../services/channels.service";
import { BlueprintPanel } from "../components/ui/BlueprintPanel";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Tag } from "../components/ui/Tag";
import { cn } from "../utils/cn";
import { formatClock } from "../utils/format";

export function MessagesPage() {
  const [channels, setChannels] = useState<ChannelSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [meName, setMeName] = useState("");

  const reloadList = () => {
    channelsService.list().then(list => {
      setChannels(list);
      if (!activeId && list.length) setActiveId(list[0].id);
    });
  };

  useEffect(reloadList, []);

  useEffect(() => {
    if (!activeId) return;
    channelsService.open(activeId).then(({ messages }) => setMessages(messages));
    reloadList();
  }, [activeId]);

  const active = channels.find(c => c.id === activeId);
  const unreadTotal = channels.reduce((a, c) => a + c.unread, 0);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;
    const msg = await channelsService.send(activeId, draft.trim());
    setMeName(msg.from);
    setMessages(m => [...m, msg]);
    setDraft("");
  }

  return (
    <section className="p-11 pb-13 flex flex-col gap-7">
      <header className="flex items-end gap-3.5">
        <div className="flex-1">
          <h6 className="kicker">Fig. 09 — Floor comms</h6>
          <h2 className="text-[40px] tracking-tight">Messages</h2>
        </div>
        <span className="text-xs text-accent-700">{unreadTotal ? `${unreadTotal} unread` : "All caught up"}</span>
      </header>

      <div className="grid gap-5 items-stretch" style={{ gridTemplateColumns: "288px minmax(0,1fr)" }}>
        <BlueprintPanel className="self-start">
          {channels.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              className={cn("block w-full text-left px-3.5 py-2.5 border-0 border-b transition-colors hover:bg-ink/5", c.id === activeId && "bg-accent-100")}
              style={{ borderColor: "rgba(11,34,48,0.08)" }}
            >
              <span className="flex items-baseline justify-between gap-1.5">
                <span className="font-heading font-semibold text-base">{c.name}</span>
                {c.unread > 0 && <Tag variant="accent">{c.unread}</Tag>}
              </span>
              <span className="block text-[11px] tracking-wide uppercase text-ink/64">{c.kind === "direct" ? "Direct" : `${c.memberCount} members`}</span>
              <span className="block text-xs mt-1 truncate text-ink/66">{c.preview}</span>
            </button>
          ))}
        </BlueprintPanel>

        <BlueprintPanel className="flex flex-col" style={{ minHeight: 520 }}>
          <div className="px-[18px] py-3.5 border-b border-divider">
            <div className="font-heading font-semibold text-xl">{active?.name}</div>
            <div className="text-[11px] tracking-wide uppercase text-ink/64">
              {active ? (active.kind === "direct" ? "Direct message" : `${active.memberCount} members · ${messages.length} messages`) : ""}
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-[18px] flex flex-col gap-3.5">
            {messages.map(m => {
              const mine = m.from === meName;
              return (
                <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[76%] px-3.5 py-2.5 border", mine ? "border-accent bg-accent-100" : "border-divider")}>
                    <div className="flex gap-2.5 items-baseline mb-1">
                      <span className="font-heading font-semibold text-[13px]">{m.from}</span>
                      <span className="text-[11px] text-ink/64">{formatClock(m.occurredAt)}</span>
                    </div>
                    <div className="text-sm">{m.body}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={send} className="p-[18px] border-t border-divider grid gap-1.5" style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}>
            <Input placeholder="Message the team" value={draft} onChange={e => setDraft(e.target.value)} className="min-h-[44px]" />
            <Button type="submit" variant="primary" className="min-h-[44px] min-w-[84px]">Send</Button>
          </form>
        </BlueprintPanel>
      </div>
    </section>
  );
}
