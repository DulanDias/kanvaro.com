import { redirect } from 'next/navigation';

export default function HomePage() {
  // For now, redirect to setup or login based on initialization status
  // This will be implemented in the setup wizard phase
  redirect('/setup');
}
