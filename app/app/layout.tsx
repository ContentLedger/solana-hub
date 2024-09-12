import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { AnchorWalletProvider } from "@/components/anchor-wallet-provider";
import { QueryProvider } from "@/components/query-provider";

import "./globals.css";
import AppStateConsumer from "@/hooks/useAppState";

export const metadata: Metadata = {
  title: "Content Ledger",
  description: "A decentralized content ledger",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <QueryProvider>
          <AppStateConsumer>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AnchorWalletProvider>
                <div className="min-h-screen">
                  <Header className="sticky top-0 z-50" />
                  <main>{children}</main>
                  <footer className="flex gap-6 flex-wrap items-center justify-center py-4 sticky top-[100vh] text-muted-foreground">
                    2024 © Content Ledger
                  </footer>
                </div>
              </AnchorWalletProvider>
            </ThemeProvider>
          </AppStateConsumer>
        </QueryProvider>
      </body>
    </html>
  );
}
