import { Inter } from 'next/font/google';
import './globals.css';
import { schoolConfig } from "@/lib/env";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: schoolConfig.name,
  description: schoolConfig.tagline || "School Management Portal",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}
