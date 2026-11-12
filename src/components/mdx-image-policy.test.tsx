import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getMDXComponents } from './mdx';

describe('documentation image request policy', () => {
  it('loads the thumbnail and enlarged image without sending the reading URL', async () => {
    const Image = getMDXComponents().img;
    render(
      <Image
        alt="API diagram"
        src="https://web-cdn.agora.io/docs-files/diagram"
      />,
    );
    const thumbnail = screen.getByRole('img', { name: 'API diagram' });
    expect(thumbnail).toHaveAttribute('referrerpolicy', 'no-referrer');

    fireEvent.click(
      screen.getByRole('button', { name: 'Zoom image: API diagram' }),
    );
    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('img', { name: 'API diagram' }),
    ).toHaveAttribute('referrerpolicy', 'no-referrer');
  });

  it('preserves an explicit source policy in both image sizes', async () => {
    const Image = getMDXComponents().img;
    render(
      <Image
        alt="API diagram"
        referrerPolicy="origin"
        src="https://web-cdn.agora.io/docs-files/diagram"
      />,
    );
    expect(screen.getByRole('img', { name: 'API diagram' })).toHaveAttribute(
      'referrerpolicy',
      'origin',
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Zoom image: API diagram' }),
    );
    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('img', { name: 'API diagram' }),
    ).toHaveAttribute('referrerpolicy', 'origin');
  });
});
