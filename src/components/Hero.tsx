'use client';

import { motion } from 'framer-motion';
import Script from 'next/script';
import { useState } from 'react';
import LowTicketBackground from './LowTicketBackground';

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  // If the placeholder VSL fails to load (404 or unsupported), we hide the
  // <video poster="/poster.svg" poster="/poster.svg"> entirely so we don't leave a busted player on the live site.
  const [videoOk, setVideoOk] = useState(true);
  const [error, setError] = useError(null);
  
  // Google Drive video ID for embed
  const videoId = "1wj5ie-CjHnhavzTkfRRtTz1gPshteq3L";

  return (
    <section
      id="top"
      // Tighter top padding on mobile (pt-24) so the headline sits closer to
      // the top edge; opens up vertical room on tiny screens. pt-32 / pt-[120px]
      // unchanged on tablet+.
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-5 pb-20 pt-24 sm:pt-28 md:pt-[120px]"
    >
      <LowTicketBackground />

      {/* HEADLINE — Inter Tight 900 throughout, gold on the highlight line.
          clamp lower bound dropped 48 -> 38 so it never wraps awkwardly on
          a 320px viewport (e.g. iPhone SE). Top end (100px) unchanged. */}
      <h1
        className="relative z-10 text-center"
        style={{
          color: 'var(--white)',
          fontFamily: 'var(--font-inter-tight), Inter Tight, system-ui, sans-serif',
          fontWeight: 900,
          letterSpacing: '-0.025em',
          lineHeight: 0.96,
        }}
      >
        <motion.span
          className="block"
          style={{ fontSize: 'clamp(32px, 5.5vw, 54px)' }}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: easeOutExpo }}
        >
          What if your entire
        </motion.span>

        <motion.span
          className="block"
          style={{ fontSize: 'clamp(32px, 5.5vw, 54px)' }}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: easeOutExpo }}
        >
          peptide company was
        </motion.span>

        <motion.span
          className="block"
          style={{
            fontSize: 'clamp(32px, 5.5vw, 54px)',
            color: 'var(--gold)',
            textShadow: '0 0 60px rgba(212,175,55,0.35)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.85, ease: easeOutExpo }}
        >
          Built For You?
        </motion.span>
      </h1>

      {/* VSL PLAYER — Google Drive embed as temporary solution until YouTube hosting is set up.
          Margin-top tighter on mobile (mt-10) so the player isn't pushed
          below the fold. */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.4, ease: easeOutExpo }}
        className="liquid-glass relative z-10 mt-10 w-full max-w-[1180px] overflow-hidden md:mt-16"
        style={{
          aspectRatio: '16 / 9',
          borderRadius: 24,
          boxShadow:
            '0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(212,175,55,0.12)',
        }}
      >
        {videoOk ? (
          <iframe
            src={`https://drive.google.com/file/d/${videoId}/preview?autoplay=0`}
            className="h-full w-full"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {error ? (
              <div
                style={{
                  color: 'red',
                  padding: 20,
                  textAlign: 'center',
                }}
              >
                Video error: {error.message}
              </div>
            ) : (
              // Glass card fallback — same dimensions, just a placeholder
              // so the layout doesn't collapse before the real VSL is dropped in.
              <div
                className="flex h-full w-full flex-col items-center justify-center text-center"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(212,175,55,0.08), transparent 65%), #0d0d0d',
                  color: 'rgba(244,237,224,0.6)',
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontSize: 12,
                  padding: 24,
                }}
              >
                <span style={{ color: 'var(--gold)', marginBottom: 8 }}>Orovia</span>
                <span>VSL coming soon</span>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* TYPEFORM EMBED — `data-tf-live` is hydrated by the embed.js script
          loaded once below. The script's `afterInteractive` strategy keeps
          the page interactive while it pulls the form async. */}
      <motion.div
        id="apply"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.6, ease: easeOutExpo }}
        className="relative z-10 mt-12 w-full max-w-[720px] md:mt-20"
        style={{ minHeight: 600 }}
      >
        <div
          data-tf-live="01KQQZVTBGYBA25M4SS2N9WW71"
          className="w-full"
          style={{ minHeight: 600 }}
        />
      </motion.div>
      <Script
        src="//embed.typeform.com/next/embed.js"
        strategy="afterInteractive"
      />
    </section>
  );
}

// Helper hook to avoid TS error on useState null
function useError<T>(initial: T | null) {
  return useState<T | null>(initial);
}
