import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LeadFlash — Speed-to-Lead Instant Follow-Up',
  description:
    'Respond to every inbound lead within 60 seconds with AI-personalized SMS and email. Two-way SMS, hot lead alerts, and time-to-contact tracking.',
  openGraph: {
    title: 'LeadFlash — Speed-to-Lead Instant Follow-Up',
    description:
      'Respond to every inbound lead within 60 seconds with AI-personalized SMS and email.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
