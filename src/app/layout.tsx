import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk, Space_Mono } from "next/font/google";
import { SITE } from "@/lib/site";
import "@/styles/globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["300", "400", "500", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
  colorScheme: "dark",
};

const SEO_DESCRIPTION =
  "Naman Khandelwal — Full-Stack Developer & CS student at IIIT Lucknow (2024–2028). Summer of Bitcoin intern at Formstr. Builds Go + Next.js systems, contributes to tauri, fedimint, and Checkmate. Codeforces Specialist · LeetCode Knight · Google CTF Rank 146.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Naman Khandelwal",
    template: `%s | Naman Khandelwal`,
  },
  description: SEO_DESCRIPTION,
  applicationName: "Naman Khandelwal Portfolio",
  authors: [{ name: SITE.author, url: SITE.url }],
  creator: SITE.author,
  publisher: SITE.author,
  keywords: [
    "Naman Khandelwal",
    "naman khandelwal portfolio",
    "naman khandelwal developer",
    "naman khandelwal IIIT Lucknow",
    "naman khandelwal github",
    "Sky-walkerX",
    "SkywalkerX codeforces",
    "IIIT Lucknow developer",
    "Summer of Bitcoin 2026",
    "Formstr intern",
    "full-stack developer India",
    "Go developer",
    "Next.js developer",
    "distributed systems",
    "NATS JetStream",
    "competitive programmer India",
    "Codeforces Specialist",
    "LeetCode Knight",
    "Google CTF",
    "open source contributor",
    "tauri contributor",
    "fedimint contributor",
    "Checkmate contributor",
    "portfolio",
  ],
  alternates: { canonical: "/" },
  formatDetection: { email: false, telephone: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: "Naman Khandelwal",
    title: "Naman Khandelwal — Full-Stack Developer",
    description: SEO_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Naman Khandelwal · Full-Stack Developer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Naman Khandelwal — Full-Stack Developer",
    description: SEO_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/assets/nk-logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/assets/nk-logo.svg",
    apple: "/assets/nk-logo.svg",
  },
  category: "technology",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    url: SITE.url,
    email: `mailto:${SITE.email}`,
    image: `${SITE.url}/assets/nk-logo.svg`,
    jobTitle: "Full-stack Developer · Summer of Bitcoin Intern",
    worksFor: { "@type": "Organization", name: "Formstr" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "IIIT Lucknow" },
    sameAs: [SITE.github, SITE.linkedin],
    description: SITE.description,
  };

  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
      data-density="normal"
    >
      <body data-scanlines="on" data-grid="on" data-motion="on" data-cursor-blink="on">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
