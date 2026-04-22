import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "../components/Navigation";
import { TimerProvider } from "@/components/TimerContext";
import { AuthProvider } from "@/components/AuthContext";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Academic Management System",
  description: "Track your studies, manage goals, and boost your academic performance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* The AuthProvider and TimerProvider must wrap Navigation and Main */}
        <AuthProvider>
          <TimerProvider>
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
          </TimerProvider>
        </AuthProvider>

      </body>
    </html>
  );
}