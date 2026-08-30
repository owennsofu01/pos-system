import { useState } from "react";
import { Role } from "../../types/domain";
import { staffService } from "../../services/staff.service";
import { Dialog } from "../ui/Dialog";
import { Field, Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { ChoiceChips } from "../ui/ChoiceChips";

const ROLES: Role[] = ["admin", "manager", "cashier", "viewer"];

export function StaffFormDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("cashier");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!name.trim()) { setError("A staff account needs a name."); return; }
    setBusy(true);
    try {
      await staffService.create({ name: name.trim(), email, role });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog width={424} zIndex={55}>
      <h4 className="mb-6 text-[19px] tracking-wide">Add staff account</h4>
      <div className="flex flex-col gap-3.5">
        <Field label="Name" className="!m-0"><Input value={name} onChange={e => setName(e.target.value)} /></Field>
        <Field label="Email" className="!m-0"><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></Field>
        <div>
          <div className="text-xs mb-1.5 text-ink/70">Role</div>
          <ChoiceChips options={ROLES} value={role} onChange={setRole} labelFor={r => r.charAt(0).toUpperCase() + r.slice(1)} />
        </div>
      </div>
      <div className="flex items-center gap-3.5 mt-5">
        <span className="flex-1 text-xs text-accent-800">{error}</span>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={save} disabled={busy}>Create account</Button>
      </div>
    </Dialog>
  );
}
