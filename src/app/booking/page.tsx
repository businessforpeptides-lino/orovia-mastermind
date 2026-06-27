import type { Metadata } from 'next';
import BookingPage from '@/components/BookingPage';

export const metadata: Metadata = {
  title: 'Book Your Strategy Call — Orovia',
  description: 'You\'ve been pre-qualified. Select a time to speak with Lino about building your FDA-compliant peptide company in 90 days.',
};

export default function Booking() {
  return <BookingPage />;
}
