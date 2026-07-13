import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import ErrorBoundary from "@/components/ErrorBoundary";

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
    icon: "/favicon.png",
    apple: "/favicon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
        <ErrorBoundary>
          <AuthProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
