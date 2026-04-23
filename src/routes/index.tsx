import { createFileRoute, Link } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { HomePage } from '@/components/home/HomePage';
import { useBaseLayoutOptions } from '@/lib/layout.shared';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const options = useBaseLayoutOptions({ variant: 'home' });

  return (
    <HomeLayout {...options} className="bg-transparent">
      <Link hidden params={{ _splat: '' }} to="/docs/$" />
      <HomePage />
    </HomeLayout>
  );
}
