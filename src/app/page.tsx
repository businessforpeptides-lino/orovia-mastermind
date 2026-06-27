import Hero from '@/components/Hero';
import FilmGrain from '@/components/FilmGrain';
import MotionRoot from '@/components/MotionRoot';
import AppWrapper from '@/components/AppWrapper';
import BelowFold from '@/components/BelowFold';

export default function Page() {
  return (
    <MotionRoot>
      {/* FilmGrain only — HeroBackground owns the full atmospheric backdrop.
          PageBackground not used here to avoid conflicting with flip cards.
          BelowFold lazy-loads CostOfDoingNothing, FinalCTA, StickyApplyButton. */}
      <FilmGrain />

      <AppWrapper>
        <main>
          <Hero />
          <BelowFold />
        </main>
      </AppWrapper>
    </MotionRoot>
  );
}
