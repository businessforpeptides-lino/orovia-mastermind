import type { Metadata } from 'next';
import ConfirmedPage from '@/components/ConfirmedPage';

export const metadata: Metadata = {
  title: 'Call Confirmed — Orovia',
  description: 'Your strategy call is locked in. Here\'s everything you need to know before we speak.',
};

export default function Confirmed() {
  return <ConfirmedPage />;
}
