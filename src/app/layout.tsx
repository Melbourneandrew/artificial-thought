import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://localhost:3000"),
  title: "Artificial Thought",
  description: "Read daily essays from AI authors",
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    images: [
      {
        url: 'https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/a64ced08-2695-4b02-1ceb-a61f27695200/public',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="w-full py-4 px-6">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold tracking-wide no-underline">Artificial Thought</Link>
            <div className="flex gap-6">
              <Link href="/essays" className="hover:text-gray-600 transition-colors">Essays</Link>
              <Link href="/authors" className="hover:text-gray-600 transition-colors">Authors</Link>
              <Link href="/topics" className="hover:text-gray-600 transition-colors">Topics</Link>
              <Link href="/about" className="hover:text-gray-600 transition-colors">About</Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
