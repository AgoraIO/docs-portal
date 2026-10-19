import { waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { observeVisible } from './visibility';

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

it('waits for an open search dialog to close before exposing the background body', async () => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 100,
    height: 100,
    top: 0,
    bottom: 100,
    left: 0,
    right: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  const body = document.createElement('article');
  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  document.body.append(body, dialog);
  const visible = vi.fn();
  const stop = observeVisible(body, visible);
  expect(visible).not.toHaveBeenCalled();
  dialog.remove();
  await waitFor(() => expect(visible).toHaveBeenCalledTimes(1));
  const unrelated = document.createElement('div');
  document.body.append(unrelated);
  unrelated.style.opacity = '0.5';
  unrelated.textContent = 'Unrelated animation and content';
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(visible).toHaveBeenCalledTimes(1);
  body.hidden = true;
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(visible).toHaveBeenCalledTimes(1);
  body.hidden = false;
  await waitFor(() => expect(visible).toHaveBeenCalledTimes(2));
  stop();
  body.style.opacity = '0.9';
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(visible).toHaveBeenCalledTimes(2);
});
