'use client';

import { useEffect, useRef } from 'react';
import s from './LowTicketBackground.module.css';

/**
 * Pharmaceutical peptide vial SVG.
 * Dark rubber stopper at top, clear glass body with white outline —
 * matches the reference: visible silhouette against a dark background.
 */
function VialSvg() {
  return (
    <svg
      viewBox="0 0 54 130"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-hidden="true"
    >
      {/* ── Rubber stopper / crimp cap ── */}
      {/* Main stopper body — dark near-black */}
      <rect x="7" y="2" width="40" height="28" rx="4"
        fill="#1c1c1c" />
      {/* Top highlight on stopper */}
      <rect x="7" y="2" width="40" height="9" rx="4"
        fill="rgba(255,255,255,0.10)" />
      {/* Crimp ring line */}
      <rect x="7" y="24" width="40" height="3"
        fill="rgba(255,255,255,0.07)" />
      {/* Stopper outline */}
      <rect x="7" y="2" width="40" height="28" rx="4"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.8" />

      {/* ── Glass body ── */}
      {/* Fill: barely-there, almost transparent */}
      <rect x="3" y="28" width="48" height="98" rx="5"
        fill="rgba(220,235,255,0.06)" />
      {/* Bright white stroke — this is what makes it visible */}
      <rect x="3" y="28" width="48" height="98" rx="5"
        fill="none"
        stroke="rgba(255,255,255,0.60)"
        strokeWidth="1.2" />

      {/* Left glass highlight (inner bright edge) */}
      <rect x="9" y="33" width="7" height="86" rx="4"
        fill="rgba(255,255,255,0.09)" />

      {/* Right shadow edge */}
      <rect x="40" y="33" width="5" height="86" rx="3"
        fill="rgba(0,0,0,0.14)" />

      {/* Bottom cap — flat glass bottom */}
      <rect x="3" y="120" width="48" height="6" rx="3"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.8" />

      {/* Faint label area */}
      <rect x="10" y="50" width="34" height="44" rx="3"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="0.6" />
    </svg>
  );
}

export default function LowTicketBackground() {
  const glowRef  = useRef<HTMLDivElement>(null);
  const vialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      const x = (e.clientX / window.innerWidth  - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      glowRef.current.style.transform = `translate(${x}px, ${y}px)`;
      if (vialsRef.current) {
        vialsRef.current.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div className={s.bgDots} />
      <div ref={glowRef} className={s.bgGlow} />
      <div className={s.bgGrain} />
      <div className={s.bgVignette} />
      <div ref={vialsRef} className={s.vials}>
        <div className={s.vial1}><VialSvg /></div>
        <div className={s.vial2}><VialSvg /></div>
        <div className={s.vial3}><VialSvg /></div>
      </div>
    </>
  );
}
