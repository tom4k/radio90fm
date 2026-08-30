import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radio 90 FM - Administration Portal",
  description: "Web Administration & Schedule Management for Radio 90 FM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-950 text-neutral-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
