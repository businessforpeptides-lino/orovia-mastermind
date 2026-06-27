import type { Metadata } from 'next';
import OnboardingPage from '@/components/OnboardingPage';

export const metadata: Metadata = {
  title: 'Welcome to the Orovia Protocol',
  description: 'You\'ve made the best decision of your life. Start here.',
};

export default function Onboarding() {
  return <OnboardingPage />;
}
