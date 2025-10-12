'use client'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/layout/navbar';
import Footer from "@/components/layout/footer";
import { ChatProvider } from "@/contexts/ChatContext";
import ChatContainer from "@/components/ui/chat/ChatContainer";
import { usePathname } from 'next/navigation'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdmining = false
  
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#0F172A] text-white`}
      >
        {!isAdmining && (
          <ChatProvider>
            <Navbar />
            <main className="flex-grow pt-16">{children}</main>
            <ChatContainer />
            <Footer />
          </ChatProvider>
        )}
        {isAdmining && (
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow w-full px-4 py-6 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">{children}</main>
          </div>
        )}
      </body>
    </html>
  );
}
