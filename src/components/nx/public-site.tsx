"use client";

import * as React from "react";
import { LandingPage } from "./landing-page";
import { AuthScreen } from "./auth-screen";
import type { User } from "@/lib/types";

type View = "landing" | "auth";

/**
 * PublicSite — shown when the user has no session.
 *
 * Holds the view state client-side so we can toggle between the marketing
 * landing page and the AuthScreen without a route change (the app only
 * exposes `/`). On successful auth, we hard-reload so the server picks up
 * the new session cookie and renders <AppShell> instead.
 */
export function PublicSite() {
  const [view, setView] = React.useState<View>("landing");

  if (view === "auth") {
    return <AuthScreen onBack={() => setView("landing")} />;
  }

  return (
    <LandingPage
      onGetStarted={() => setView("auth")}
      onLogin={() => setView("auth")}
    />
  );
}

// Re-export for convenience
export type { User };
