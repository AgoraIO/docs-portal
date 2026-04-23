import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { DefaultNotFound } from 'fumadocs-ui/layouts/home/not-found';
import { useBaseLayoutOptions } from '@/lib/layout.shared';

export function NotFound() {
  const options = useBaseLayoutOptions();

  return (
    <HomeLayout {...options}>
      <DefaultNotFound />
    </HomeLayout>
  );
}
