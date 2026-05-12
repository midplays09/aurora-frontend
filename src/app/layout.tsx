import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aurora — Music, reimagined',
  description: 'Search, discover, and listen to millions of tracks. Build playlists, favorite songs, and enjoy live radio — all in one beautiful experience.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
