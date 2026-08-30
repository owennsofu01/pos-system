import { useEffect, useState } from "react";
import { CURRENCIES, EmailSecurity, EmailSettings, Settings, Staff } from "../types/domain";
import { settingsService } from "../services/settings.service";
import { staffService } from "../services/staff.service";
import { BlueprintPanel } from "../components/ui/BlueprintPanel";
import { Field, Input, Textarea } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ChoiceChips } from "../components/ui/ChoiceChips";
import { Table } from "../components/ui/Table";
import { Tag } from "../components/ui/Tag";
import { StaffFormDialog } from "../components/staff/StaffFormDialog";

const SECURITY_OPTIONS: EmailSecurity[] = ["None", "TLS", "SSL"];
const CURRENCY_CODES = CURRENCIES.map(c => c.code);

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [email, setEmail] = useState<EmailSettings | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [staffForm, setStaffForm] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailNote, setEmailNote] = useState("");

  const reload = () => {
    settingsService.get().then(setSettings);
    settingsService.getEmail().then(setEmail);
    staffService.list().then(setStaff);
  };
  useEffect(reload, []);

  async function saveProfile() {
    if (!settings) return;
    setSavingProfile(true);
    try { setSettings(await settingsService.update(settings)); }
    finally { setSavingProfile(false); }
  }

  async function saveEmail() {
    if (!email) return;
    setSavingEmail(true);
    try { setEmail(await settingsService.updateEmail(email)); }
    finally { setSavingEmail(false); }
  }

  async function sendTest() {
    if (!email) return;
    const result = await settingsService.sendTest(email.replyTo);
    setEmailNote(result.message);
  }

  async function removeStaffMember(id: number) {
    if (!confirm("Remove this staff account?")) return;
    await staffService.remove(id);
    reload();
  }

  if (!settings || !email) return <div className="p-11 text-sm text-ink/60">Loading…</div>;

  return (
    <section className="p-11 pb-13 flex flex-col gap-10">
      <header>
        <h6 className="kicker">Fig. 08 — Configuration</h6>
        <h2 className="text-[40px] tracking-tight">Settings</h2>
      </header>

      <div className="grid grid-cols-2 gap-11 items-start">
        <BlueprintPanel className="p-7">
          <h4 className="mb-6 text-[19px] tracking-wide">Business profile</h4>
          <div className="grid grid-cols-2 gap-3.5">
            <Field label="Business name" className="col-span-2 !m-0">
              <Input value={settings.businessName} onChange={e => setSettings({ ...settings, businessName: e.target.value })} />
            </Field>
            <Field label="Business type" className="!m-0">
              <Input value={settings.businessType} onChange={e => setSettings({ ...settings, businessType: e.target.value })} />
            </Field>
            <Field label="Tax rate %" className="!m-0">
              <Input type="number" min={0} step={0.5} value={settings.taxRate} onChange={e => setSettings({ ...settings, taxRate: Number(e.target.value) })} />
            </Field>
            <div className="col-span-2">
              <div className="text-xs mb-1.5 text-ink/70">Currency</div>
              <ChoiceChips options={CURRENCY_CODES} value={settings.currency} onChange={c => setSettings({ ...settings, currency: c })} />
              <div className="text-[11px] mt-1.5 text-accent-700">
                Prices, totals, receipts and reports all render in {settings.currency}.
              </div>
            </div>
            <Field label="Low stock threshold" className="!m-0">
              <Input type="number" min={0} value={settings.lowStockThreshold} onChange={e => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })} />
            </Field>
            <Field label="Loyalty points per unit spent" className="!m-0">
              <Input type="number" min={0} step={0.5} value={settings.pointsPerUnit} onChange={e => setSettings({ ...settings, pointsPerUnit: Number(e.target.value) })} />
            </Field>
            <Field label="Receipt footer" className="col-span-2 !m-0">
              <Textarea value={settings.receiptFooter} onChange={e => setSettings({ ...settings, receiptFooter: e.target.value })} />
            </Field>
            <Button variant="primary" className="col-span-2 justify-self-start" onClick={saveProfile} disabled={savingProfile}>
              {savingProfile ? "Saving…" : "Save business profile"}
            </Button>
          </div>
        </BlueprintPanel>

        <BlueprintPanel className="p-7">
          <h4 className="mb-6 text-[19px] tracking-wide">Email</h4>
          <div className="grid grid-cols-2 gap-3.5">
            <Field label="Sender name" className="!m-0"><Input value={email.fromName} onChange={e => setEmail({ ...email, fromName: e.target.value })} /></Field>
            <Field label="From address" className="!m-0"><Input type="email" value={email.fromAddress} onChange={e => setEmail({ ...email, fromAddress: e.target.value })} /></Field>
            <Field label="Reply-to" className="!m-0"><Input type="email" value={email.replyTo} onChange={e => setEmail({ ...email, replyTo: e.target.value })} /></Field>
            <Field label="SMTP username" className="!m-0"><Input value={email.username} onChange={e => setEmail({ ...email, username: e.target.value })} /></Field>
            <Field label="SMTP host" className="!m-0"><Input value={email.host} onChange={e => setEmail({ ...email, host: e.target.value })} /></Field>
            <Field label="Port" className="!m-0"><Input type="number" min={1} value={email.port} onChange={e => setEmail({ ...email, port: Number(e.target.value) })} /></Field>
            <div className="col-span-2">
              <div className="text-xs mb-1.5 text-ink/70">Encryption</div>
              <ChoiceChips options={SECURITY_OPTIONS} value={email.security} onChange={s => setEmail({ ...email, security: s })} />
            </div>
            <Field label="Receipt subject line" className="col-span-2 !m-0">
              <Input value={email.subjectTemplate} onChange={e => setEmail({ ...email, subjectTemplate: e.target.value })} />
            </Field>
            <div className="col-span-2 text-[11px] text-ink/66">
              Preview: {email.subjectTemplate.replace("{business}", settings.businessName).replace("{receipt}", "R-24812")}
            </div>
            <label className="radio col-span-2 flex items-center gap-2 text-[13px] cursor-pointer">
              <input type="checkbox" checked={email.autoSend} onChange={e => setEmail({ ...email, autoSend: e.target.checked })} />
              {email.autoSend ? "Receipts email automatically when a customer is attached" : "Receipts are only emailed on request"}
            </label>
            <div className="col-span-2 flex items-center gap-3.5">
              <Button variant="secondary" className="min-h-10" onClick={sendTest}>Send test email</Button>
              <span className="flex-1 text-[11px] text-accent-700">{emailNote}</span>
            </div>
            <Button variant="primary" className="col-span-2 justify-self-start" onClick={saveEmail} disabled={savingEmail}>
              {savingEmail ? "Saving…" : "Save email settings"}
            </Button>
          </div>
        </BlueprintPanel>

        <div>
          <div className="flex items-end gap-3.5 mb-3.5">
            <h4 className="flex-1">Staff</h4>
            <Button variant="primary" className="h-9" onClick={() => setStaffForm(true)}>Add staff</Button>
          </div>
          <Table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th /></tr></thead>
            <tbody>
              {staff.map(m => (
                <tr key={m.id}>
                  <td className="font-heading font-semibold text-[15px]">{m.name}</td>
                  <td className="text-muted text-xs">{m.email}</td>
                  <td><Tag variant={m.role === "admin" ? "accent" : m.role === "viewer" ? "neutral" : "outline"}>{m.role}</Tag></td>
                  <td className="text-right"><Button variant="ghost" className="text-xs" onClick={() => removeStaffMember(m.id)}>Remove</Button></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {staffForm && <StaffFormDialog onClose={() => setStaffForm(false)} onSaved={() => { setStaffForm(false); reload(); }} />}
    </section>
  );
}
