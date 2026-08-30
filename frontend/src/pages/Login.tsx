import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useSettings } from "../hooks/useSettings";
import { authService } from "../services/auth.service";
import { BlueprintPanel } from "../components/ui/BlueprintPanel";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Input";

export function LoginPage() {
  const staff = useAuthStore(s => s.staff);
  const login = useAuthStore(s => s.login);
  const { settings } = useSettings();

  const [mode, setMode] = useState<"signIn" | "reset">("signIn");
  const [email, setEmail] = useState("r.vasquez@meridian.co");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [resetNote, setResetNote] = useState("");

  if (staff) return <Navigate to="/" replace />;

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setResetNote("");
    setBusy(true);
    try {
      const { message } = await authService.requestReset(resetEmail);
      setResetNote(message);
    } catch (err) {
      setResetNote(err instanceof Error ? err.message : "Could not send reset link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 grid grid-cols-2 min-h-screen bg-bg">
      <div className="bg-accent-900 text-bg p-14 flex flex-col justify-between">
        <div>
          <div className="font-heading font-semibold text-[40px] leading-none">{settings.businessName}</div>
          <div className="text-[11px] tracking-[0.14em] uppercase opacity-70 mt-2">Point of sale · Terminal 01</div>
        </div>
        <div className="text-sm max-w-[360px] opacity-85 leading-relaxed">
          Sales, stock and receipts for one till.
        </div>
        <div className="text-[11px] tracking-wide uppercase opacity-60">Build 1.0 · Production</div>
      </div>

      <div className="grid place-items-center p-14">
        <BlueprintPanel className="w-[380px] p-8">
          {mode === "signIn" ? (
            <form onSubmit={handleSignIn} className="flex flex-col gap-4.5">
              <h3 className="text-[27px] mb-2">Sign in</h3>
              <Field label="Email">
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="min-h-[42px]" required />
              </Field>
              <Field label="Password">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-1.5">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="min-h-[42px]"
                    required
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-[42px] min-w-[66px] text-xs tracking-wide uppercase"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </div>
              </Field>
              {error && <div className="text-xs text-accent-800">{error}</div>}
              <Button type="submit" variant="primary" className="!block w-full !h-[50px] text-[17px] tracking-wide relative" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
              <Button type="button" variant="ghost" className="text-xs tracking-wide uppercase" onClick={() => setMode("reset")}>
                Forgot password
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-4.5">
              <h3 className="text-[27px] mb-2.5">Reset password</h3>
              <p className="text-[13px] text-ink/70 mb-1">We will email a single-use link to the address on the account.</p>
              <Field label="Account email">
                <Input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="min-h-[42px]" required />
              </Field>
              <div className="text-[11px] min-h-[30px] text-accent-700">{resetNote}</div>
              <Button type="submit" variant="primary" className="w-full h-[50px] text-[17px] tracking-wide" disabled={busy}>
                Send reset link
              </Button>
              <Button type="button" variant="ghost" className="text-xs tracking-wide uppercase" onClick={() => setMode("signIn")}>
                Back to sign in
              </Button>
            </form>
          )}
        </BlueprintPanel>
      </div>
    </div>
  );
}
