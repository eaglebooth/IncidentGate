import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IncidentGate — Semantic circuit breaker",
  description: "GenLayer-powered pre-transaction incident protection for autonomous treasuries.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
