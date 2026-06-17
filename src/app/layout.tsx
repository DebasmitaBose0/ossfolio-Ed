import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}