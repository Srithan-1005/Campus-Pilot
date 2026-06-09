import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Pilot - Smart Campus Super App",
  description: "A unified digital campus operating system integrating student portal, admin dashboard, payments, and AI Copilot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
