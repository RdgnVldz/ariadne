import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
});

export const metadata: Metadata = {
  title: { default: "Ariadne", template: "%s | Ariadne" },
  description: "Tailored resumes and cover letters for every job you apply to.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={schibsted.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}