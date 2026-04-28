import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import { AppBar } from "@/components/AppBar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jbm = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mint AI - Autonomous Agent Console",
  description:
    "Self-sustaining AI agents earning x402 micropayments on Solana with on-chain memory anchored to Filecoin.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jbm.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground">
        {/* WCAG 2.4.1: Skip to main content */}
        <a href="#main" className="skip-link">
          Skip to main content
        </a>

        <TooltipProvider delayDuration={200}>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <AppBar />
              <main id="main" tabIndex={-1} className="flex-1 px-4 py-6 md:px-8 md:py-8">
                {children}
              </main>
            </div>
          </div>
        </TooltipProvider>

        <Toaster position="bottom-right" toastOptions={{ className: "border-border" }} />
      </body>
    </html>
  );
}
