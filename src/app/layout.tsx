import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { generateHomeMetadata, generateWebsiteJsonLd, performanceConfig } from "@/lib/seo";
import { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Advanced SEO metadata
export const metadata: Metadata = generateHomeMetadata();

// Viewport configuration for optimal mobile experience
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

// Generate structured data
const websiteJsonLd = generateWebsiteJsonLd();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Performance optimization resources */}
        {performanceConfig.dns.map((dns, index) => (
          <link key={`dns-${index}`} {...dns} />
        ))}
        {performanceConfig.prefetch.map((prefetch, index) => (
          <link key={`prefetch-${index}`} {...prefetch} />
        ))}

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />

        {/* Additional SEO tags */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="robots" content="index,follow" />
        <meta name="googlebot" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
        <meta name="bingbot" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />

        {/* Performance and security headers */}
        <meta httpEquiv="X-DNS-Prefetch-Control" content="on" />
        <meta name="format-detection" content="telephone=no" />

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}

        {/* Google Search Console Verification */}
        {process.env.GOOGLE_VERIFICATION_CODE && (
          <meta name="google-site-verification" content={process.env.GOOGLE_VERIFICATION_CODE} />
        )}

        {/* Bing Webmaster Tools Verification */}
        {process.env.BING_VERIFICATION_CODE && (
          <meta name="msvalidate.01" content={process.env.BING_VERIFICATION_CODE} />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1" role="main">
            {children}
          </main>
          <Footer />
          <Analytics mode="production" />;
        </AuthProvider>
      </body>
    </html>
  );
}
