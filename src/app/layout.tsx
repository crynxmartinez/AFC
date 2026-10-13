import type { Metadata } from 'next';
import './globals.css';
import { Arena } from '@/components/Arena';
import { getState } from '@/lib/state';
import { pageMetadata, siteDescription, siteUrl } from '@/lib/seo';
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  ...pageMetadata('AFC — Art & Cosplay Contests for Creatives', siteDescription, '/'),
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialState = JSON.parse(JSON.stringify(await getState()));
  return (
    <html lang="en">
      <body>
        <Arena initialState={initialState}>{children}</Arena>
      </body>
    </html>
  );
}
