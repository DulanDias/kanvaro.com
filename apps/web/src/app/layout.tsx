import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kanvaro - Agile project management, fast and learnable',
  description: 'Performance-first, single-tenant, open source project management system',
  keywords: ['project management', 'agile', 'kanban', 'scrum', 'open source'],
  authors: [{ name: 'Kanvaro Team' }],
  openGraph: {
    title: 'Kanvaro - Agile project management, fast and learnable',
    description: 'Performance-first, single-tenant, open source project management system',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kanvaro - Agile project management, fast and learnable',
    description: 'Performance-first, single-tenant, open source project management system',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
