import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { weddingConfig } from "@/config/wedding";
import "./globals.css";
import "./design.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8f5ef",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1")
    ? "http"
    : "https";
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: weddingConfig.share.title,
    description: weddingConfig.share.description,
    robots: {
      index: weddingConfig.searchEngineIndex,
      follow: weddingConfig.searchEngineIndex,
    },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      title: weddingConfig.share.title,
      description: weddingConfig.share.description,
      images: [{ url: weddingConfig.share.image, width: 1732, height: 908 }],
    },
    twitter: {
      card: "summary_large_image",
      title: weddingConfig.share.title,
      description: weddingConfig.share.description,
      images: [weddingConfig.share.image],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
