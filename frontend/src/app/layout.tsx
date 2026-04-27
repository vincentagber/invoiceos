import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CollaborationProvider } from "@/context/CollaborationContext";
import { SocketProvider } from "@/context/SocketContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: 'swap' });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", weight: ['400', '500', '600', '700', '800'], display: 'swap' });

export const metadata: Metadata = {
  title: "InvoiceOS | Online Invoicing Software for Small Businesses & Freelancers",
  description: "Create professional invoices in seconds, track payments, and automate your billing. The all-in-one revenue engine for modern freelancers and growing agencies.",
  keywords: ["invoicing software", "small business billing", "online invoices", "freelance invoicing", "invoice generator", "payment tracking"],
  authors: [{ name: "InvoiceOS Team" }],
  openGraph: {
    title: "InvoiceOS | Professional Invoicing & Payment Optimization",
    description: "The next generation of invoicing and revenue intelligence for ambitious businesses.",
    url: "https://invoiceos.com",
    siteName: "InvoiceOS",
    images: [
      {
        url: "/emerald-hero.png",
        width: 1200,
        height: 630,
        alt: "InvoiceOS Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InvoiceOS | Smart Invoicing for Small Business",
    description: "Get paid faster with professional invoices and automated payment tracking.",
    images: ["/emerald-hero.png"],
  },
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
      <body className={`${inter.variable} ${outfit.variable} font-sans tabular-nums bg-slate-50 text-slate-900 antialiased`}>
        <AuthProvider>
          <SocketProvider>
            <CollaborationProvider>
              {children}
            </CollaborationProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
