import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Should This Be an Agent? | Serpin",
  description:
    "Score your use case in 2 minutes. Find out if your process is a good candidate for an AI agent \u2014 or if there's a better approach.",
  icons: {
    icon: "/serpin-favicon.png",
  },
  openGraph: {
    title: "Should This Be an Agent?",
    description:
      "Score your use case in 2 minutes. Free assessment from the Agent Discovery and Design Framework.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
