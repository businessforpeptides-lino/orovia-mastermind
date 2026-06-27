import type { Metadata } from 'next';
import AdminPage from '@/components/AdminPage';

export const metadata: Metadata = {
  title: 'Admin — Orovia',
  description: 'Internal dashboard',
};

export default function Admin() {
  return <AdminPage />;
}
