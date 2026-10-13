import type { Metadata } from 'next';
export const siteUrl = (process.env.APP_URL || 'https://www.arenaforcreatives.online').replace(
  /\/$/,
  '',
);
export const siteDescription =
  'Discover original art and cosplay, explore every creative stage, and support your favorite creators in AFC contests.';
export const publicEntry = { status: 'APPROVED', contest: { status: { not: 'DRAFT' } } };
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  image?: string,
): Metadata {
  const summary = description.replace(/\s+/g, ' ').trim().slice(0, 160) || siteDescription;
  const imageUrl = new URL(image || '/share-image', siteUrl).toString();
  return {
    title,
    description: summary,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: 'AFC — Arena for Creatives',
      locale: 'en_US',
      title,
      description: summary,
      url: path,
      images: [{ url: imageUrl, alt: title, ...(!image ? { width: 1200, height: 630 } : {}) }],
    },
    twitter: { card: 'summary_large_image', title, description: summary, images: [imageUrl] },
  };
}
