'use client';

import { useEffect, useRef, useState } from 'react';
import s from './CostOfDoingNothing.module.css';
import CountUp from './CountUp';

/** Simple dollar bill SVG */
function MoneyBill() {
  return (
    <svg viewBox="0 0 90 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0" y="0" width="90" height="40" rx="3"
        fill="#1a3d2a" stroke="#2d5c3a" strokeWidth="0.8" />
      <rect x="3" y="3" width="84" height="34" rx="2"
        fill="none" stroke="#2d6a40" strokeWidth="0.5" opacity="0.7" />
      <ellipse cx="45" cy="20" rx="11" ry="9"
        fill="none" stroke="#3d7a4d" strokeWidth="0.8" opacity="0.8" />
      <text x="45" y="24" textAnchor="middle"
        fill="#4a9960" fontSize="10" fontFamily="serif" fontWeight="bold">$</text>
      <circle cx="16" cy="20" r="8" fill="none" stroke="#2d6a40" strokeWidth="0.5" opacity="0.6" />
      <text x="16" y="24" textAnchor="middle" fill="#3a8050" fontSize="7" fontFamily="serif">100</text>
      <circle cx="74" cy="20" r="8" fill="none" stroke="#2d6a40" strokeWidth="0.5" opacity="0.6" />
      <text x="74" y="24" textAnchor="middle" fill="#3a8050" fontSize="7" fontFamily="serif">100</text>
      <text x="32" y="10" fill="#2d6a40" fontSize="4.5" fontFamily="monospace" opacity="0.7">
        NH 48291047 C
      </text>
      <text x="32" y="35" fill="#2d6a40" fontSize="4.5" fontFamily="monospace" opacity="0.7">
        NH 48291047 C
      </text>
    </svg>
  );
}

const BILLS = [
  { left: '3%',  top: '10%', width: 100, rotate: '-22deg', delay: '0s',   dur: '14s' },
  { left: '7%',  top: '36%', width: 88,  rotate: '14deg',  delay: '2.1s', dur: '17s' },
  { left: '4%',  top: '62%', width: 110, rotate: '-8deg',  delay: '0.8s', dur: '12s' },
  { right: '3%', top: '8%',  width: 92,  rotate: '26deg',  delay: '1.4s', dur: '15s' },
  { right: '7%', top: '38%', width: 82,  rotate: '-16deg', delay: '3.2s', dur: '18s' },
  { right: '4%', top: '62%', width: 114, rotate: '10deg',  delay: '0.4s', dur: '13s' },
  { left: '40%', top: '74%', width: 78,  rotate: '-4deg',  delay: '2.8s', dur: '16s' },
  { left: '52%', top: '16%', width: 86,  rotate: '7deg',   delay: '1.0s', dur: '11s' },
];

/** Risk events scattered around the big number */
const RISKS = [
  { label: 'FDA Letter',          icon: '📄', top: '8%',  left: '4%',   delay: '0s',    dur: '5.4s', mobile: false },
  { label: 'Frozen Account',      icon: '🔒', top: '8%',  right: '4%',  delay: '0.6s',  dur: '6.2s', mobile: true  },
  { label: 'Processor Rejected',  icon: '🚫', top: '28%', left: '2%',   delay: '1.2s',  dur: '5.0s', mobile: false },
  { label: 'Platform Ban',        icon: '⚠️', top: '28%', right: '2%',  delay: '0.3s',  dur: '6.8s', mobile: true  },
  { label: 'Site Takedown',       icon: '🔻', top: '52%', left: '3%',   delay: '1.8s',  dur: '4.9s', mobile: false },
  { label: 'Stripe Hold',         icon: '💳', top: '52%', right: '3%',  delay: '0.9s',  dur: '5.7s', mobile: true  },
  { label: 'Reaction Lawsuit',    icon: '⚖️', top: '72%', left: '6%',   delay: '2.4s',  dur: '6.4s', mobile: false },
  { label: 'Zero Warning',        icon: '📵', top: '72%', right: '6%',  delay: '1.5s',  dur: '5.2s', mobile: false },
];

export default function CostOfDoingNothing() {
  const stageRef      = useRef<HTMLDivElement>(null);
  const cardRef       = useRef<HTMLDivElement>(null);
  const flippedRef    = useRef(false);
  const [flipped,     setFlipped]     = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showUpside,  setShowUpside]  = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const card  = cardRef.current;
    if (!stage || !card) return;

    const sentinel = document.createElement('div');
    sentinel.style.cssText =
      'position:absolute;top:50%;left:0;width:1px;height:1px;pointer-events:none;';
    stage.appendChild(sentinel);

    function triggerFlip(shouldFlip: boolean) {
      if (shouldFlip === flippedRef.current) return;
      flippedRef.current = shouldFlip;
      setIsAnimating(true);
      setFlipped(shouldFlip);
      if (shouldFlip) setShowUpside(true);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            triggerFlip(false);
          } else {
            triggerFlip(e.boundingClientRect.top < 0);
          }
        });
      },
      { root: null, threshold: 0 }
    );
    observer.observe(sentinel);

    function onTransitionEnd() { setIsAnimating(false); }
    card.addEventListener('transitionend', onTransitionEnd);

    let scrollTimer: ReturnType<typeof setTimeout>;
    function onScroll() {
      setIsAnimating(true);
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => setIsAnimating(false), 150);
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      sentinel.remove();
      card.removeEventListener('transitionend', onTransitionEnd);
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimer);
    };
  }, []);

  return (
    <section id="cost">
      <div ref={stageRef} className={s.pinStage}>
        <div className={`${s.pinTarget} ${flipped ? s.isFlipped : ''}`}>
          <div ref={cardRef} className={`${s.flipCard} ${isAnimating ? s.isAnimating : ''}`}>

            {/* ── FRONT FACE ── */}
            <div className={`${s.flipFace} ${s.frontFace}`}>

              {/* Money bills — background layer */}
              <div className={s.moneyLayer} aria-hidden="true">
                {BILLS.map((b, i) => (
                  <div
                    key={i}
                    className={s.bill}
                    style={{
                      position: 'absolute',
                      width: b.width,
                      top: b.top,
                      left: 'left' in b ? b.left : undefined,
                      right: 'right' in b ? b.right : undefined,
                      animationDelay: b.delay,
                      animationDuration: b.dur,
                      ['--rot' as string]: `rotate(${b.rotate})`,
                    } as React.CSSProperties}
                  >
                    <MoneyBill />
                  </div>
                ))}
              </div>

              {/* Floating risk cards — scattered around center */}
              {RISKS.map((r, i) => (
                <div
                  key={i}
                  className={`${s.riskCard} ${r.mobile ? s.riskMobile : ''}`}
                  style={{
                    position: 'absolute',
                    top: r.top,
                    left: 'left' in r ? r.left : undefined,
                    right: 'right' in r ? r.right : undefined,
                    animationDelay: r.delay,
                    animationDuration: r.dur,
                  }}
                >
                  <span className={s.riskIcon}>{r.icon}</span>
                  <span className={s.riskLabel}>{r.label}</span>
                </div>
              ))}

              {/* Central content */}
              <div className={s.centerContent}>
                <span className={s.pill}>The Cost of Doing Nothing</span>

                <h2 className={s.losingLine}>And you&apos;re losing money.</h2>

                <div className={s.bigNumberWrap}>
                  <div className={s.bigNumber}>
                    <CountUp to={20000} format="currency" duration={2.0} />
                    <span className={s.bigNumberSuffix}>/frozen</span>
                  </div>
                  <p className={s.sub}>
                    <span className={s.subLine}>Locked in Stripe the day the processor flags you.</span>
                    <span className={s.subLine}>Most peptide sellers don&apos;t see it coming.</span>
                  </p>
                </div>
              </div>

              <div className={s.scrollHint} aria-hidden="true">
                <div className={s.scrollDot} />
              </div>
            </div>

            {/* ── BACK FACE ── */}
            <div className={`${s.flipFace} ${s.backFace}`}>
              <div className={s.upsideInner}>
                <span className={`${s.pill} ${s.pillGold}`}>The Upside</span>

                <h2 className={s.upsideHead}>
                  A working, safe peptide company.{' '}
                  <span className={s.accent}>That&apos;s it.</span>
                </h2>

                <p className={s.upsideBody}>
                  Same peptides. Same products. Same clients. The only thing
                  that changes is the system that builds the foundation
                  underneath them.
                </p>

                <div className={s.upsideCards}>
                  <div className={s.upsideCard}>
                    <div className={s.upsideLabel}>Before Orovia Protocol</div>
                    <div className={s.upsideValue}>
                      <CountUp to={20000} format="currency" duration={1.4} start={showUpside} />
                    </div>
                    <div className={s.upsideNote}>Frozen in Stripe. Account closed without warning.</div>
                  </div>
                  <div className={s.arrowCol} aria-hidden="true">→</div>
                  <div className={`${s.upsideCard} ${s.upsideCardGold}`}>
                    <div className={s.upsideLabel}>After Orovia Protocol</div>
                    <div className={s.upsideValue}>
                      <CountUp to={120000} format="currency" duration={1.6} start={showUpside} />
                      <span className={s.perMo}>/mo</span>
                    </div>
                    <div className={s.upsideNote}>FDA-compliant, scaling without fear of the trapdoor.</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
