import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
metadataBase: new URL("https://ossfolio.qzz.io"),

title: "OSSfolio — Your Open Source Identity",
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
images: ["/og-image.png"],
},

twitter: {
card: "summary_large_image",
title: "OSSfolio — Your Open Source Identity",
description: "Your open-source identity, beyond GitHub.",
images: ["/og-image.png"],
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
      </head>

      <body className={inter.className}>{children}</body>
    </html>
  );
}
