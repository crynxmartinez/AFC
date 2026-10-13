import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'http://127.0.0.1:3000'),
  title: 'AFC — Arena for Creatives',
  description:
    'Create something extraordinary. Discover art and cosplay, explore the process, and support your favorite creators.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
