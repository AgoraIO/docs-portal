import {
  type ComponentProps,
  type RefObject,
  useLayoutEffect,
  useRef,
} from 'react';

type TabInputHandlers = Pick<
  ComponentProps<'div'>,
  'onMouseDownCapture' | 'onKeyDownCapture' | 'onFocusCapture'
>;

/** Keep the initiating tab row still when synchronized upstream panels resize. */
export function useTabScrollAnchor({
  enabled,
  rootRef,
  value,
  onMouseDownCapture,
  onKeyDownCapture,
  onFocusCapture,
}: TabInputHandlers & {
  enabled: boolean;
  rootRef: RefObject<HTMLDivElement | null>;
  value: string | undefined;
}): TabInputHandlers {
  const pending = useRef<{
    list: HTMLElement;
    top: number;
    owner: HTMLElement | null;
    expiry: number;
    value: string | undefined;
  } | null>(null);

  function capture(target: EventTarget | null) {
    const root = rootRef.current;
    const tab =
      target instanceof Element
        ? target.closest<HTMLElement>('[role="tab"]')
        : null;
    if (
      !enabled ||
      !root ||
      !tab ||
      tab.closest('[data-mdx-tabs-root], .docs-code-tabs') !== root ||
      tab.getAttribute('aria-selected') === 'true' ||
      pending.current
    )
      return;
    const list = tab.closest<HTMLElement>('[role="tablist"]');
    if (!list) return;
    let owner = list.parentElement;
    while (
      owner &&
      owner !== document.body &&
      owner !== document.documentElement
    ) {
      const style = window.getComputedStyle(owner);
      if (
        /(auto|scroll|overlay)/.test(style.overflowY || style.overflow) &&
        owner.scrollHeight > owner.clientHeight
      )
        break;
      owner = owner.parentElement;
    }
    const anchor = {
      list,
      top: list.getBoundingClientRect().top,
      owner:
        owner === document.body || owner === document.documentElement
          ? null
          : owner,
      expiry: 0,
      value,
    };
    pending.current = anchor;
    // Only this input's commit may compensate, never a later storage/hash update.
    anchor.expiry = window.setTimeout(() => {
      if (pending.current === anchor) pending.current = null;
    }, 0);
  }

  useLayoutEffect(() => {
    const anchor = pending.current;
    pending.current = null;
    if (!anchor) return;
    window.clearTimeout(anchor.expiry);
    if (anchor.value === value || !anchor.list.isConnected) return;
    // Correct only the residual displacement after native scroll anchoring.
    const delta = anchor.list.getBoundingClientRect().top - anchor.top;
    if (Math.abs(delta) < 1) return;
    if (anchor.owner)
      anchor.owner.scrollTo({
        top: anchor.owner.scrollTop + delta,
        behavior: 'instant',
      });
    else window.scrollTo({ top: window.scrollY + delta, behavior: 'instant' });
  }, [value]);

  useLayoutEffect(
    () => () => {
      if (pending.current) window.clearTimeout(pending.current.expiry);
      pending.current = null;
    },
    [],
  );

  return {
    onMouseDownCapture: (event) => {
      onMouseDownCapture?.(event);
      if (!event.defaultPrevented && event.button === 0 && !event.ctrlKey)
        capture(event.target);
    },
    onKeyDownCapture: (event) => {
      onKeyDownCapture?.(event);
      if (
        !event.defaultPrevented &&
        (event.key === 'Enter' || event.key === ' ')
      )
        capture(event.target);
    },
    onFocusCapture: (event) => {
      onFocusCapture?.(event);
      if (!event.defaultPrevented) capture(event.target);
    },
  };
}
