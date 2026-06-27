'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Sticky floating CTA, bottom-right.
 * Hidden over the hero (scrollY < 90vh).
 * Hidden again when within 200px of the final CTA (id="final-cta").
 */
export default function StickyApplyButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const past90 = window.scrollY > window.innerHeight * 0.9;
      const finalEl = document.getElementById('final-cta');
      let nearFinal = false;
      if (finalEl) {
        const rect = finalEl.getBoundingClientRect();
        nearFinal = rect.top < window.innerHeight - 200 && rect.bottom > 0;
      }
      setVisible(past90 && !nearFinal);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href="#apply"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -2, boxShadow: '0 0 40px rgba(212,175,55,0.6)' }}
          className="fixed z-40 flex items-center gap-3 rounded-full px-7 py-4"
          style={{
            bottom: 'var(--sticky-bottom, 32px)',
            right: 'var(--sticky-right, 32px)',
            background:
              'linear-gradient(180deg, #f0d068 0%, #D4AF37 60%, #8a7124 100%)',
            color: '#141414',
            border: '1px solid rgba(255,232,160,0.5)',
            boxShadow:
              '0 12px 30px rgba(0,0,0,0.55), 0 0 24px rgba(212,175,55,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
            textDecoration: 'none',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#141414',
              opacity: 0.65,
              animation: 'gold-pulse 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontFamily:
                'var(--font-inter-tight), Inter Tight, system-ui, sans-serif',
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Apply Now
          </span>
          <style jsx>{`
            a { --sticky-bottom: 32px; --sticky-right: 32px; }
            @media (max-width: 767px) {
              a {
                --sticky-bottom: 20px;
                --sticky-right: 20px;
                padding: 12px 20px;
              }
            }
          `}</style>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
