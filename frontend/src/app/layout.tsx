import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CollaborationProvider } from "@/context/CollaborationContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "InvoiceOS | Revenue Intelligence Platform",
  description: "Next-gen invoicing and payment optimization engine.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans tabular-nums bg-slate-50 text-slate-900`}>
        <AuthProvider>
          <CollaborationProvider>
            {children}
          </CollaborationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
