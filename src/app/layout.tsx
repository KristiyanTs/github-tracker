import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
        title: "GitHub Activity Tracker | Break the Rules, Own Your Code",
      description: "Transform GitHub contribution data into stunning visuals for CVs. Generate heatmaps, analytics, and charts to showcase coding activity.",
  keywords: ["github", "contributions", "developer", "analytics", "cv", "resume", "portfolio"],
  authors: [{ name: "GitHub Activity Tracker" }],
  openGraph: {
    title: "GitHub Activity Tracker",
          description: "Transform GitHub activity into killer visuals for CVs",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
