import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { SkipToContent } from "@/components/ui/SkipToContent";
import "./globals.css";
import { JsonLd } from "@/components/ui/json-ld";


const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = "https://ossfolio.qzz.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "OSSfolio — Your Open Source Identity",
    template: "%s - OSSfolio",
  },
  description:
    "A public profile platform for open-source contributors. Showcase your merged PRs, contribution streaks, orgs, and more at ossfolio.me/username.",

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  openGraph: {
    title: "OSSfolio — Your Open Source Identity",
    description: "Your open-source identity, beyond GitHub.",
    type: "website",
    siteName: "OSSfolio",
    locale: "en_US",
    url: siteUrl,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },

  twitter: {
    card: "summary_large_image",
    title: "OSSfolio — Your Open Source Identity",
    description: "Your open-source identity, beyond GitHub.",
    images: ["/og-image.png"],
    creator: "@ossfolio",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-7Q6TXP5W7G"
        />

        <Script id="google-analytics">
          {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-7Q6TXP5W7G');
      `}
        </Script>

        <script
          dangerouslySetInnerHTML={{
            __html: `
          try {
            const storedTheme = localStorage.getItem('theme');

            if (
              storedTheme === 'dark' ||
              (!storedTheme &&
                window.matchMedia('(prefers-color-scheme: dark)').matches)
            ) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch (_) {}
        `,
          }}
        />

        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "OSSfolio",
            url: siteUrl,
            description:
              "Open-source contributor profile platform. Showcase your merged PRs, streaks, organizations, and contribution score.",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            author: {
              "@type": "Person",
              name: "PRODHOSH V.S",
              url: "https://github.com/PRODHOSH",
            },
          }}
        />
      </head>

      <body className={inter.className}>
        <SkipToContent />
        {children}
      </body>
    </html>
  );
}
