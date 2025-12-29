import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Remote",
  description: "Control your entertainment system",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Remote",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
