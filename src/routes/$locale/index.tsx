import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/')({
  loader: ({ params }) => {
    throw redirect({
      to: '/$locale/$tab',
      params: {
        locale: params.locale,
        tab: 'introduction',
      },
    });
  },
  component: () => null,
});
