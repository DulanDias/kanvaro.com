import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://kanvaro.com'),
  title: {
    default: 'Kanvaro – Agile project management, fast and learnable',
    template: '%s – Kanvaro',
  },
  description:
    'Performance-first, single-tenant, open-source project management system.',
  applicationName: 'Kanvaro',
  creator: 'Kanvaro Team',
  keywords: [
    'kanban',
    'scrum',
    'project management',
    'open source',
    'single-tenant',
  ],
  alternates: { canonical: 'https://kanvaro.com' },
  openGraph: {
    url: 'https://kanvaro.com',
    siteName: 'Kanvaro',
    title: 'Kanvaro – Agile project management, fast and learnable',
    description:
      'Performance-first, single-tenant, open-source project management system.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kanvaro',
    description: 'Agile project management, fast and learnable',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
