"use client";

import * as React from "react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import { Mail, Phone, User as UserIcon, ArrowLeft, Sparkles, ShieldCheck, Loader2, KeyRound } from "lucide-react";

/** Extract the human-readable error message from an `api()` rejection. */
function parseApiError(err: any, fallback: string): string {
  const raw = err?.message ?? fallback;
  // api() throws: "API <status>: <body>" — body is JSON like {"error":"..."}
  const m = raw.match(/API \d+: (.+)$/s);
  if (m) {
    try {
      const parsed = JSON.parse(m[1]);
      if (parsed?.error) return parsed.error;
    } catch {}
    return m[1];
  }
  return raw;
}

type Mode = "login" | "register";
type Step = "form" | "otp";

const REGISTER_ROLES = [
  { value: "RESIDENT", label: "🏠 Resident", desc: "I live here — join the community" },
  { value: "BUSINESS_OWNER", label: "🏪 Business Owner", desc: "I run a local business" },
  { value: "SERVICE_PROVIDER", label: "🛠️ Service Provider", desc: "I offer services (plumbing, tutoring, etc)" },
  { value: "EMPLOYER", label: "💼 Employer", desc: "I hire locally" },
];

const DEMO_USERS = [
  { email: "arjun@nx.in", name: "Arjun Deshmukh", role: "👑 SUPER_ADMIN" },
  { email: "priya@nx.in", name: "Priya Kulkarni", role: "🏘️ SOCIETY_ADMIN" },
  { email: "ravi@nx.in", name: "Ravi Shinde", role: "🏪 BUSINESS_OWNER" },
  { email: "anita@nx.in", name: "Anita Desai", role: "🛠️ SERVICE_PROVIDER" },
  { email: "mahesh@nx.in", name: "Mahesh Jadhav", role: "💼 EMPLOYER" },
  { email: "vijay@nx.in", name: "Vijay More", role: "🏠 RESIDENT" },
];

export function AuthScreen({ onAuthenticated }: { onAuthenticated?: (user: User) => void }) {
  const [mode, setMode] = React.useState<Mode>("login");
  const [step, setStep] = React.useState<Step>("form");
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState("RESIDENT");
  const [otp, setOtp] = React.useState("");
  const [demoOtp, setDemoOtp] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [resendIn, setResendIn] = React.useState(0);

  // resend countdown
  React.useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const resetToForm = () => {
    setStep("form");
    setOtp("");
    setDemoOtp(null);
    setResendIn(0);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    resetToForm();
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const payload: any = { email, mode };
      if (mode === "register") {
        payload.name = name;
        payload.phone = phone;
        payload.role = role;
      }
      const res = await api<{ ok: boolean; demoOtp?: string; error?: string; expiresIn?: number }>(
        "/api/auth/send-otp",
        { method: "POST", body: JSON.stringify(payload) },
      );
      if (res.demoOtp) {
        setDemoOtp(res.demoOtp);
        toast.success(`OTP sent! Demo code: ${res.demoOtp}`, {
          description: "In production this would arrive via SMS/email.",
          duration: 8000,
        });
      } else {
        toast.success("OTP sent! Check your email/SMS.");
      }
      setStep("otp");
      setResendIn(30);
    } catch (err: any) {
      toast.error(parseApiError(err, "Failed to send OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP code.");
      return;
    }
    setLoading(true);
    try {
      const payload: any = { email, code: otp, mode };
      if (mode === "register") {
        payload.name = name;
        payload.phone = phone;
        payload.role = role;
      }
      const res = await api<{ ok: boolean; user: User; error?: string }>(
        "/api/auth/verify-otp",
        { method: "POST", body: JSON.stringify(payload) },
      );
      toast.success(
        mode === "register" ? "Welcome to NeighborX! 🎉" : `Welcome back, ${res.user.name}!`,
        {
          description:
            mode === "register"
              ? "Your account has been created with 10 welcome reward points."
              : "You are now signed in.",
        },
      );
      onAuthenticated?.(res.user);
      // Hard reload to pick up the server-rendered AppShell with the new session
      if (!onAuthenticated) {
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (err: any) {
      toast.error(parseApiError(err, "Verification failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || loading) return;
    setLoading(true);
    try {
      const payload: any = { email, mode };
      if (mode === "register") {
        payload.name = name;
        payload.phone = phone;
        payload.role = role;
      }
      const res = await api<{ ok: boolean; demoOtp?: string }>("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.demoOtp) setDemoOtp(res.demoOtp);
      toast.success("New OTP sent!");
      setResendIn(30);
    } catch {
      toast.error("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (d: (typeof DEMO_USERS)[number]) => {
    setMode("login");
    setEmail(d.email);
    setName("");
    setPhone("");
    setOtp("");
    setStep("form");
    toast.info(`Loaded demo: ${d.name} (${d.role})`);
  };

  return (
    <div className="min-h-screen-dvh flex flex-col bg-gradient-to-br from-emerald-50 via-background to-orange-50 dark:from-emerald-950/30 dark:via-background dark:to-orange-950/20">
      {/* Top brand bar */}
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>OTP-secured · No passwords</span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Marketing */}
          <div className="hidden flex-col justify-center lg:flex">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              India&apos;s hyperlocal super app
            </div>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight">
              Your Neighborhood.
              <br />
              <span className="text-gradient">Built on Trust.</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Connect with verified neighbors, discover local businesses, find jobs, get help in
              emergencies, and build a stronger community — all in one place.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {[
                "🏘️ 100% verified residents — no fake accounts",
                "🛡️ 10-level admin hierarchy for safe communities",
                "⚡ Real-time chat, alerts, and SOS",
                "🛒 Marketplace, services, jobs — all hyperlocal",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-xl border bg-card p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Try a demo account (1-click)
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_USERS.map((d) => (
                  <button
                    key={d.email}
                    onClick={() => fillDemo(d)}
                    className="tap-feedback rounded-lg border bg-background p-2 text-left text-xs transition-colors hover:border-primary/40 hover:bg-accent"
                  >
                    <div className="truncate font-semibold">{d.name}</div>
                    <div className="truncate text-muted-foreground">{d.role}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Auth form */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
              {/* Step: form */}
              {step === "form" && (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                      {mode === "login" ? "Welcome back 👋" : "Create your account 🎉"}
                    </h2>
                  </div>

                  {/* Mode toggle */}
                  <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
                    <button
                      onClick={() => switchMode("login")}
                      className={cn(
                        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground",
                      )}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => switchMode("register")}
                      className={cn(
                        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        mode === "register" ? "bg-background shadow-sm" : "text-muted-foreground",
                      )}
                    >
                      Register
                    </button>
                  </div>

                  <form onSubmit={handleSendOtp} className="space-y-4">
                    {mode === "register" && (
                      <>
                        <div className="space-y-1.5">
                          <Label htmlFor="name">Full name</Label>
                          <div className="relative">
                            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Arjun Deshmukh"
                              className="pl-9"
                              required
                              autoComplete="name"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="phone">Phone (10 digits)</Label>
                          <div className="relative">
                            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="phone"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                              placeholder="9822012345"
                              className="pl-9"
                              required
                              inputMode="numeric"
                              autoComplete="tel"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="role">I am a…</Label>
                          <Select value={role} onValueChange={setRole}>
                            <SelectTrigger id="role">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {REGISTER_ROLES.map((r) => (
                                <SelectItem key={r.value} value={r.value}>
                                  <div className="flex flex-col">
                                    <span>{r.label}</span>
                                    <span className="text-xs text-muted-foreground">{r.desc}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email address</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="pl-9"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <KeyRound className="mr-2 h-4 w-4" />
                      )}
                      {loading
                        ? "Sending OTP…"
                        : mode === "login"
                          ? "Send login OTP"
                          : "Send registration OTP"}
                    </Button>
                  </form>

                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    {mode === "login" ? "New to NeighborX? " : "Already have an account? "}
                    <button
                      onClick={() => switchMode(mode === "login" ? "register" : "login")}
                      className="font-semibold text-primary hover:underline"
                    >
                      {mode === "login" ? "Create an account" : "Login instead"}
                    </button>
                  </p>
                </>
              )}

              {/* Step: OTP */}
              {step === "otp" && (
                <>
                  <button
                    onClick={resetToForm}
                    className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <h2 className="text-xl font-bold">Enter the 6-digit code</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We sent an OTP to <span className="font-semibold text-foreground">{email}</span>
                  </p>

                  {demoOtp && (
                    <div className="mt-4 rounded-lg border border-dashed border-emerald-300 bg-emerald-50 p-3 text-center dark:border-emerald-800 dark:bg-emerald-950/30">
                      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                        Demo OTP (no SMS gateway)
                      </div>
                      <div className="mt-1 font-mono text-2xl font-bold tracking-widest text-emerald-700 dark:text-emerald-300">
                        {demoOtp}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="mt-6 space-y-6">
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(v) => setOtp(v)}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {loading
                        ? "Verifying…"
                        : mode === "login"
                          ? "Login"
                          : "Create account & login"}
                    </Button>
                  </form>

                  <div className="mt-4 text-center text-xs text-muted-foreground">
                    Didn&apos;t receive it?{" "}
                    {resendIn > 0 ? (
                      <span>Resend in {resendIn}s</span>
                    ) : (
                      <button
                        onClick={handleResend}
                        disabled={loading}
                        className="font-semibold text-primary hover:underline disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile demo accounts */}
            <div className="mt-4 rounded-xl border bg-card p-4 lg:hidden">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Demo accounts (1-click fill)
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_USERS.map((d) => (
                  <button
                    key={d.email}
                    onClick={() => fillDemo(d)}
                    className="tap-feedback rounded-lg border bg-background p-2 text-left text-xs transition-colors hover:border-primary/40 hover:bg-accent"
                  >
                    <div className="truncate font-semibold">{d.name}</div>
                    <div className="truncate text-muted-foreground">{d.role}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-background/80 py-4 text-center text-xs text-muted-foreground">
        © 2026 NeighborX · Made for India 🇮🇳 · OTP-based passwordless auth
      </footer>
    </div>
  );
}
