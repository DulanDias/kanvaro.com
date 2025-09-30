import { redirect } from 'next/navigation';

export default function HomePage() {
  // For now, redirect to a demo board
  // This will be implemented properly with authentication
  redirect('/board/demo-board');
}
