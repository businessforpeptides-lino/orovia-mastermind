import type { Metadata } from 'next';
import {
  helveticaNowDisplay,
  helveticaNowText,
  citadelScript,
  wordmarkFont,
  monoFont,
  dmSerifDisplay,
  interTightFont,
  cormorantFont,
} from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Orovia Protocol',
  description: 'What if your entire peptide company was built for you?',
  metadataBase: new URL('https://oroviamastermind.com'),
  openGraph: {
    title: 'The Orovia Protocol',
    description: 'What if your entire peptide company was built for you?',
    type: 'website',
    url: 'https://oroviamastermind.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Orovia Protocol',
    description: 'What if your entire peptide company was built for you?',
  },
};

// Next 16 split viewport out of metadata. Setting viewport-fit=cover makes
// iOS respect safe-area insets so the gold halo + film grain extend edge to
// edge under the notch / home indicator.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
  themeColor: '#141414',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={[
        helveticaNowDisplay.variable,
        helveticaNowText.variable,
        citadelScript.variable,
        wordmarkFont.variable,
        monoFont.variable,
        dmSerifDisplay.variable,
        interTightFont.variable,
        cormorantFont.variable,
      ].join(' ')}
    >
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
