# Findings

## 2026-05-11
- The repository is at `/Users/yangyixuan/Documents/GitHub/docs-portal`.
- The dev server is configured by Vite and targets port `3000` in `vite.config.ts`.
- The app route `/` resolves the Overview experience through `src/routes/index.tsx`.
- The Overview left sidebar appears to be hard-coded inside `src/components/home/PlatformHomePage.tsx`, not driven by the docs submodule tree.
- The worktree is already dirty. `src/components/home/PlatformHomePage.tsx` is untracked, and several related home/overview files are modified or newly added.
