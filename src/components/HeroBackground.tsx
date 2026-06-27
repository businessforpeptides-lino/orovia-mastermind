'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Vial from './Vial';
import s from './HeroBackground.module.css';

/**
 * Hero background — charcoal + gold halo, three blurred light streaks,
 * glossy floor, and 4 peptide vials in a depth-of-field layout.
 *
 * Depth system:
 *   vialNear  → sharp, full opacity, larger (foreground)
 *   vialFar   → blur(3px) + opacity 0.6 (background)
 *
 * Left column:  vial2 (far) sits behind vial1 (near)
 * Right column: vial4 (far) sits behind vial3 (near)
 *
 * GSAP entrance: streaks → far vials → near vials (back.out)
 * Responsive widths + mobile far-vial hiding via HeroBackground.module.css.
 */
export default function HeroBackground() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });

      // 1 — streaks slide in from left
      tl.from('[data-streak]', {
        opacity: 0,
        scaleX: 0.4,
        transformOrigin: 'left center',
        duration: 1.1,
        stagger: 0.12,
        ease: 'power3.out',
      });

      // 2 — background (far) vials rise in
      tl.from('[data-vial-far]', {
        opacity: 0,
        y: 50,
        scale: 0.7,
        duration: 1.0,
        stagger: 0.15,
        ease: 'power3.out',
      }, '-=0.6');

      // 3 — foreground (near) vials with more drama
      tl.from('[data-vial-near]', {
        opacity: 0,
        y: 70,
        scale: 0.65,
        rotation: '+=8',
        duration: 1.3,
        stagger: 0.18,
        ease: 'back.out(1.5)',
      }, '-=0.7');
    }, stageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* ── Base gradient — charcoal + gold halo ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 35% at 50% -8%, rgba(212,175,55,0.42) 0%, rgba(212,175,55,0.14) 30%, transparent 65%), radial-gradient(ellipse 100% 80% at 50% 50%, #141414 0%, #0c0c0c 100%)',
        }}
      />

      {/* ── Screen-blend bloom on the gold halo ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 35% 18% at 50% 0%, rgba(240,208,104,0.48), transparent 75%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* ── Bottom vignette ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 50% at 50% 100%, rgba(0,0,0,0.55), transparent 60%)',
        }}
      />

      {/* ── Light streaks — horizontal blurred gold beams ── */}
      <div className="absolute inset-0">
        <div
          data-streak
          style={{
            position: 'absolute',
            left: '-10%',
            top: '22%',
            width: '70%',
            height: 3,
            background:
              'linear-gradient(90deg, transparent, rgba(212,175,55,0.55) 30%, rgba(240,208,104,0.35) 60%, transparent)',
            filter: 'blur(6px)',
            transform: 'rotate(-3deg)',
            opacity: 0.75,
          }}
        />
        <div
          data-streak
          style={{
            position: 'absolute',
            right: '-8%',
            top: '35%',
            width: '60%',
            height: 2,
            background:
              'linear-gradient(270deg, transparent, rgba(212,175,55,0.45) 35%, rgba(240,208,104,0.28) 65%, transparent)',
            filter: 'blur(8px)',
            transform: 'rotate(2.5deg)',
            opacity: 0.65,
          }}
        />
        <div
          data-streak
          style={{
            position: 'absolute',
            left: '5%',
            top: '55%',
            width: '45%',
            height: 2,
            background:
              'linear-gradient(90deg, transparent, rgba(212,175,55,0.38) 40%, transparent)',
            filter: 'blur(10px)',
            transform: 'rotate(-1.5deg)',
            opacity: 0.55,
          }}
        />
      </div>

      {/* ── Glossy floor strip ── */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '18%',
          background:
            'linear-gradient(180deg, transparent 0%, rgba(212,175,55,0.04) 40%, rgba(212,175,55,0.10) 100%)',
          borderTop: '1px solid rgba(212,175,55,0.08)',
        }}
      />

      {/* ── Vial stage ── */}
      <div className="absolute inset-0">

        {/* LEFT — far (behind), blurred */}
        <div
          data-vial-far
          className={`${s.vialWrap} ${s.vialFar} ${s.vial2}`}
          style={{ transform: 'rotate(-6deg)' }}
        >
          <Vial id="v2" />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              height: '55%',
              transform: 'scaleY(-1)',
              maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 70%)',
              WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          >
            <Vial id="v2r" />
          </div>
        </div>

        {/* LEFT — near (foreground), sharp */}
        <div
          data-vial-near
          className={`${s.vialWrap} ${s.vialNear} ${s.vial1}`}
          style={{ transform: 'rotate(5deg)' }}
        >
          <Vial id="v1" />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              height: '55%',
              transform: 'scaleY(-1)',
              maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 65%)',
              WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 65%)',
              pointerEvents: 'none',
            }}
          >
            <Vial id="v1r" />
          </div>
        </div>

        {/* RIGHT — far (behind), blurred */}
        <div
          data-vial-far
          className={`${s.vialWrap} ${s.vialFar} ${s.vial4}`}
          style={{ transform: 'rotate(7deg)' }}
        >
          <Vial id="v4" />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              height: '55%',
              transform: 'scaleY(-1)',
              maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 70%)',
              WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          >
            <Vial id="v4r" />
          </div>
        </div>

        {/* RIGHT — near (foreground), sharp */}
        <div
          data-vial-near
          className={`${s.vialWrap} ${s.vialNear} ${s.vial3}`}
          style={{ transform: 'rotate(-6deg)' }}
        >
          <Vial id="v3" />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              height: '55%',
              transform: 'scaleY(-1)',
              maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 65%)',
              WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 65%)',
              pointerEvents: 'none',
            }}
          >
            <Vial id="v3r" />
          </div>
        </div>

      </div>
    </div>
  );
}
