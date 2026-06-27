'use client';

import { useState } from 'react';
import s from './IncomeCalculator.module.css';

const MARGIN_TIERS = [
  { label: '60%', value: 60, desc: 'profit' },
  { label: '70%', value: 70, desc: 'profit' },
  { label: '80%', value: 80, desc: 'profit' },
];

function fmt(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `$${Math.round(n)}`;
}

// Tooltip left offset corrected for thumb width (22px thumb on a % track)
function thumbLeft(pct: number): string {
  const offset = ((50 - pct) * 0.22).toFixed(2);
  return `calc(${pct.toFixed(1)}% + ${offset}px)`;
}

export default function IncomeCalculator() {
  const [orders, setOrders]         = useState(10);
  const [orderValue, setOrderValue] = useState(300);
  const [marginPct, setMarginPct]   = useState(70);

  // ── derived ──────────────────────────────────────────────────────────────
  const perOrderProfit = orderValue * (marginPct / 100);
  const monthlyProfit  = orders * perOrderProfit;
  const yearlyProfit   = monthlyProfit * 12;
  const dailyProfit    = monthlyProfit / 30;
  const monthlySolo    = Math.round(orders * orderValue * 0.40);
  const extra          = monthlyProfit - monthlySolo;

  const ordersPct = ((orders - 1) / 99) * 100;
  const aovPct    = ((orderValue - 100) / 900) * 100;

  return (
    <section className={s.root}>
      <div className={s.inner}>
        <div className={s.header}>
          <div className={s.eyebrow}>Income Calculator</div>
          <h2 className={s.heading}>
            Run your own numbers.<br />
            <span className={s.gold}>See what this actually pays.</span>
          </h2>
          <p className={s.sub}>
            Set your orders per month, average order size, and margin tier. The calculator shows what you keep after costs.
          </p>
        </div>

        <div className={s.card}>
          <div className={s.cardGlow} />

          <div className={s.cols}>
            {/* ── INPUTS ── */}
            <div className={s.inputs}>

              {/* Orders per month */}
              <div className={s.inputGroup}>
                <div className={s.inputLabelRow}>
                  <span className={s.inputLabel}>Orders per month</span>
                  <span className={s.inputVal}>{orders}</span>
                </div>
                <div className={s.sliderWrap}>
                  <div className={s.sliderTooltip} style={{ left: thumbLeft(ordersPct) }}>
                    {orders}
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={orders}
                    style={{ '--p': `${ordersPct}%` } as React.CSSProperties}
                    className={s.slider}
                    onChange={e => setOrders(Number(e.target.value))}
                  />
                  <div className={s.sliderAxis}>
                    {([
                      { label: '1',   pct: 0 },
                      { label: '25',  pct: ((25  - 1) / 99) * 100 },
                      { label: '50',  pct: ((50  - 1) / 99) * 100 },
                      { label: '100', pct: 100 },
                    ] as { label: string; pct: number }[]).map(t => (
                      <span key={t.label} className={s.sliderTick} style={{ left: thumbLeft(t.pct) }}>{t.label}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Average order value */}
              <div className={s.inputGroup}>
                <div className={s.inputLabelRow}>
                  <span className={s.inputLabel}>Average order value</span>
                  <span className={s.inputVal}>${orderValue}</span>
                </div>
                <div className={s.sliderWrap}>
                  <div className={s.sliderTooltip} style={{ left: thumbLeft(aovPct) }}>
                    ${orderValue}
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={1000}
                    step={25}
                    value={orderValue}
                    style={{ '--p': `${aovPct}%` } as React.CSSProperties}
                    className={s.slider}
                    onChange={e => setOrderValue(Number(e.target.value))}
                  />
                  <div className={s.sliderAxis}>
                    {([
                      { label: '$100', pct: 0 },
                      { label: '$350', pct: ((350  - 100) / 900) * 100 },
                      { label: '$700', pct: ((700  - 100) / 900) * 100 },
                      { label: '$1k',  pct: 100 },
                    ] as { label: string; pct: number }[]).map(t => (
                      <span key={t.label} className={s.sliderTick} style={{ left: thumbLeft(t.pct) }}>{t.label}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Margin tier */}
              <div className={s.inputGroup}>
                <div className={s.inputLabel}>Margin tier</div>
                <div className={s.radioGroup}>
                  {MARGIN_TIERS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${s.radioBtn}${marginPct === opt.value ? ` ${s.radioBtnActive}` : ''}`}
                      onClick={() => setMarginPct(opt.value)}
                    >
                      <span className={s.radioBtnLabel}>{opt.label}</span>
                      <span className={s.radioBtnDesc}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── OUTPUTS ── */}
            <div className={s.outputs}>
              <div className={s.resultCard}>
                <div className={s.resultEye}>Going solo</div>
                <div className={s.resultNum}>{fmt(monthlySolo)}</div>
                <div className={s.resultPer}>/mo estimated</div>
                <p className={s.resultNote}>
                  ~40% gross margin on self-sourced product. Before platform bans, processor rejections, COA costs, and legal exposure you handle yourself.
                </p>
              </div>

              <div className={`${s.resultCard} ${s.resultCardOrovia}`}>
                <div className={s.resultEyeGold}>With Orovia Plug &amp; Play</div>
                <div className={s.resultNumGold}>{fmt(monthlyProfit)}</div>
                <div className={s.resultPer}>/mo in your pocket</div>
                <div className={s.triStats}>
                  <div className={s.triStat}>
                    <span className={s.triStatLabel}>Per day</span>
                    <span className={s.triStatNum}>{fmt(dailyProfit)}</span>
                  </div>
                  <div className={s.triStatDiv} />
                  <div className={s.triStat}>
                    <span className={s.triStatLabel}>Per year</span>
                    <span className={s.triStatNum}>{fmt(yearlyProfit)}</span>
                  </div>
                </div>
                <p className={s.resultNote}>
                  {orders} orders &times; {fmt(perOrderProfit)} profit/order. Everything else handled for you.
                </p>
              </div>
            </div>
          </div>

          {/* ── EXTRA EARNED BANNER ── */}
          <div className={s.extraBanner}>
            <div className={s.extraTop}>
              <span className={s.extraEye}>Your edge vs. going solo</span>
              <span className={s.extraNum}>+{fmt(extra)}/mo extra</span>
            </div>
            <p className={s.extraBody}>
              You find the buyer and spend 15&ndash;20 minutes over text explaining what peptides fit their goals. They place an order. Orovia ships it. They reorder next month. You just made {marginPct}% margin for a 15-minute conversation &mdash; no fulfillment, no sourcing, no overhead.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
