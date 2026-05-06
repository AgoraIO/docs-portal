import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/components/home/HomePage';

export const Route = createFileRoute('/$lang/')({
  component: Home,
});

function Home() {
  return <HomePage />;
}
