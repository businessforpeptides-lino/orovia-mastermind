'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import s from './FinalCTA.module.css';

/**
 * Final CTA — "Two Futures, One Choice".
 *
 * Side-by-side comparison: the Ban Victim (left, faded dark card with red
 * prohibition footer) vs. the Orovia Protocol (right, gold-accented card with
 * a cream CTA button that smooth-scrolls back up to the Typeform anchor).
 *
 * GSAP scroll-triggers:
 *   - heading lines fade up + stagger
 *   - bracket SVG strokes draw in
 *   - cards rise up
 *   - VS badge scales + spins in
 *   - bullets stagger in within each card
 */
export default function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Heading reveal
      const headingTl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      });
      headingTl
        .from('[data-h-line]', {
          opacity: 0,
          y: 30,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
        })
        .from(
          '[data-h-sub]',
          { opacity: 0, y: 12, duration: 0.6 },
          '-=0.4'
        );

      // Bracket — animate stroke drawing in
      gsap.utils.toArray<SVGPathElement>('[data-bracket-path]').forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: '5 5', strokeDashoffset: length });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: '[data-bracket]', start: 'top 70%' },
        });
      });

      // Cards rise up
      gsap.from('[data-card]', {
        opacity: 0,
        y: 50,
        duration: 1.0,
        stagger: 0.18,
        ease: 'power3.out',
        scrollTrigger: { trigger: '[data-cards]', start: 'top 75%' },
      });

      // VS badge — scale + rotate in
      gsap.from('[data-vs]', {
        opacity: 0,
        scale: 0,
        rotation: -180,
        duration: 0.8,
        delay: 0.4,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: '[data-cards]', start: 'top 75%' },
      });

      // Bullets stagger in inside each card
      gsap.utils.toArray<HTMLElement>('[data-card]').forEach((card) => {
        gsap.from(card.querySelectorAll(`.${s.bullet}`), {
          opacity: 0,
          x: -10,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: card, start: 'top 70%' },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={s.twoFutures} id="final-cta">
      {/* Heading */}
      <div className={s.headingStack}>
        <span className={`${s.hLine} ${s.hLineFaded}`} data-h-line>
          Two Futures.
        </span>
        <span className={`${s.hLine} ${s.hLineGold}`} data-h-line>
          One Choice.
        </span>
        <p className={s.headingSub} data-h-sub>
          Which one are you going to be?
        </p>
      </div>

      {/* Bracket */}
      <div className={s.bracket} data-bracket>
        <svg viewBox="0 0 900 90" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path
            className={s.bracketPath}
            data-bracket-path
            d="M 450 0 L 450 36 L 225 36 L 225 90"
          />
          <path
            className={s.bracketPath}
            data-bracket-path
            d="M 450 0 L 450 36 L 675 36 L 675 90"
          />
        </svg>
      </div>

      {/* Cards */}
      <div className={s.cards} data-cards>
        {/* LEFT — Ban Victim */}
        <div className={s.card} data-card>
          <div className={s.cardEyebrow}>
            Ban Victim
            <span className={s.subEyebrow}>Building on Sand</span>
          </div>

          <h3 className={s.cardHeadline}>
            Wasting Money,
            <br />
            Wasting Time
          </h3>

          <ul className={s.bullets}>
            <li className={s.bullet}>
              <span className={s.bulletIcon} />
              <span>
                Venmo + Zelle + a Stripe account{' '}
                <em>waiting to be flagged</em>
              </span>
            </li>
            <li className={s.bullet}>
              <span className={s.bulletIcon} />
              <span>
                Manual fulfillment: <em>you&apos;re the warehouse, the CSR, and the CEO</em>
              </span>
            </li>
            <li className={s.bullet}>
              <span className={s.bulletIcon} />
              <span>
                No FDA disclaimers, no age gates: <em>one wrong reaction = personal liability</em>
              </span>
            </li>
            <li className={s.bullet}>
              <span className={s.bulletIcon} />
              <span>
                Twelve-hour Shopify build, taken down{' '}
                <em>in twelve seconds</em>
              </span>
            </li>
            <li className={s.bullet}>
              <span className={s.bulletIcon} />
              <span>
                Thousands burned on tools, courses, freelancers: <em>still no real business</em>
              </span>
            </li>
          </ul>

          <div className={s.cardFooter}>
            <span className={s.banIcon} />
            <span>Two years in. Still built on sand.</span>
          </div>
        </div>

        {/* VS BADGE */}
        <div className={s.vsBadge} data-vs>
          VS
        </div>

        {/* RIGHT — Orovia Protocol */}
        <div className={`${s.card} ${s.cardWith}`} data-card>
          <div className={s.cardEyebrow}>
            The Orovia Protocol
            <span className={s.subEyebrow}>Done For You</span>
          </div>

          <h3 className={s.cardHeadline}>
            Safe Infrastructure,
            <br />
            Stacking Wins
          </h3>

          <ul className={s.bullets}>
            <li className={s.bullet}>
              <span className={s.bulletIcon} />
              <span>
                FDA-Compliant Foundation: <em>every disclaimer, every legal framework, ironclad</em>
              </span>
            </li>
            <li className={s.bullet}>
              <span className={s.bulletIcon} />
              <span>
                US-Based Compliant Processor: <em>your money flows, never freezes</em>
              </span>
            </li>
            <li className={s.bullet}>
              <span className={s.bulletIcon} />
              <span>
                Done-For-You Build: <em>website, branding, supplier, warehouse, all under your name</em>
              </span>
            </li>
            <li className={s.bullet}>
              <span className={s.bulletIcon} />
              <span>
                Cash Injection Strategy: <em>revenue moving in month one, before the build is done</em>
              </span>
            </li>
            <li className={s.bullet}>
              <span className={s.bulletIcon} />
              <span>
                Lifetime Network Access: <em>peptide-specialized ad agency, regulatory updates, the operator community</em>
              </span>
            </li>
          </ul>

          {/* CTA — smooth-scrolls back up to the Typeform anchor */}
          <a
            className={s.cardFooter}
            href="#apply"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            <span className={s.ctaMain}>Apply for the Protocol</span>
          </a>
        </div>
      </div>
    </section>
  );
}
