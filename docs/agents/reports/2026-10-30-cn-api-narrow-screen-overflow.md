# Chinese API narrow-screen overflow

The 20-page merged-table review found seven pages whose document width exceeded
the 390-pixel viewport even with their merged tables hidden. This follow-up
fixes article typography at the shared rendering boundary. No documentation
text, API names, links, table spans or code signatures are changed.

## Root causes and repair

- Long Latin API names in prose have no natural line-break opportunities. A
  line containing several linked names can overflow even though each individual
  name fits. Chinese prose paragraphs and list items now use
  `overflow-wrap: anywhere` as a fallback when a line cannot fit.
- Fumadocs renders heading text and its fixed-size copy button as flex siblings.
  The text link's automatic minimum width keeps a long API name unbroken and
  pushes the copy button beyond the article. The heading link now has
  `min-width: 0` and the same wrapping fallback.
- The article's main title can contain an API class or namespace longer than
  the available width. It receives the wrapping fallback too.

`DocsContent` marks each article with its actual locale using `lang`. The new
rules select only `article[lang="zh-CN"]`. English typography remains unchanged.
Prose rules exclude table descendants and `.not-prose` components; code
signatures and wide tables continue to use their own scroll containers.
Nothing hides or clips document overflow.

The browser feedback loop reproduced the original Unreal document width of
564 pixels and exited nonzero before the fix. Temporary changes independently
distinguished heading/prose causes from API-signature containment: changing
signature containment did not reduce the original C# width of 527 pixels;
changing prose wrapping reduced it to 445; adding heading/title wrapping
reduced it to 390. The article language regression tests also failed before
the corresponding rendering change and passed afterwards.

## Before and after

All measurements below use a 390×844 viewport.

| Page | Original document width | Fixed document width |
| --- | --- | --- |
| Marketplace FaceUnity API | 407px | 390px |
| RTC Unreal C++ screen capture | 564px | 390px |
| RTC C# screen capture | 527px | 390px |
| RTSA C API | 477px | 390px |
| RTC Server SDK IAudioFrameObserverBase | 422px | 390px |
| Local recording linuxsdk | 432px | 390px |
| RTC Server SDK ExternalVideoFrame | 425px | 390px |

Original pre-change screenshots are retained locally. For aligned comparison
pairs, the browser temporarily removes only the article language marker,
disabling the newly scoped rules to reproduce the original styles. Every
original width is asserted against the pre-change baseline; the same text is
positioned at the same vertical location, horizontal page scroll is reset to
zero, and the marker is restored for the after shot. No source text is edited
to manufacture the before state. All seven original-width assertions and all
seven fixed-width assertions pass.

## Verification

- The original 20 Chinese sample pages pass again at desktop 1280×900, narrow
  390×844 and narrow dark mode. All 20 now measure 390 pixels in both narrow
  modes. The DOM includes 100 merged tables and 2,172 cells, including hidden
  platform panels; only visible cells receive geometry checks.
- Logical table occupancy, borders, merged-cell vertical alignment, final-column
  reachability and absence of invalid structural paragraph wrappers pass.
  Keyboard scrolling passes for the 19 selected tables that overflow their
  container; the remaining selected table needs no horizontal scroll.
- Targeted tests: 198 passed, including Chinese/English article locale coverage.
- Types and lint pass. Lint retains the existing 19 warnings and five infos.
- Full suite: 322 of 323 files pass; 5,071 tests pass, two skip and one existing
  release-note link test exceeds its 15-second limit. Retrying the complete
  link-test file yields 89 passes and three 15-second timeouts while loading
  MDX content; no assertion mismatch is reported. The suite's cold transforms
  take 179 seconds in that retry. These source-link tests do not import the
  changed article component or stylesheet. Their timeouts and assertions remain
  unchanged; this follow-up does not claim a completely green full-suite run.
- No repeat of the earlier full production content build is claimed for this
  typography-only follow-up. Browser evidence uses actual Vite-compiled CSS;
  rules follow the dependency's unlayered styles to retain their cascade order.

Screenshots, aligned comparisons, the local comparison gallery and raw browser
results remain under ignored
`.agent/artifacts/merged-tables-20261030/overflow/`. They are not published or
committed. The original 20-page review artifacts remain intact.
