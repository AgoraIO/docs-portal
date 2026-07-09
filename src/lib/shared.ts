import { getDocsHomePath } from './site-region';

export const appName = 'Agora Docs';
export const appDescription =
  'Agora Docs is a protocol-inspired developer documentation surface for product docs, API reference, and AI-readable content.';
export const docsRoute = getDocsHomePath();

export const legacyDocsBannerConfig = {
  hrefs: {
    en: 'https://docs-legacy.agora.io/en',
    'zh-CN': 'https://doc.shengwang.cn/',
  },
};

export const contentGitConfig = {
  user: 'AgoraIO',
  repo: 'docs-portal',
  branch: 'main',
};
