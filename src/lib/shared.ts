import { getDefaultDocsLocale, getDocsHomePath } from './site-region';

export function getAppBranding(locale: string = getDefaultDocsLocale()) {
  return locale === 'zh-CN'
    ? {
        name: '声网文档',
        docsLabel: '文档',
        description:
          '声网开发者文档：对话式 AI、实时音视频、实时消息、SDK 下载与 API 参考。',
      }
    : {
        name: 'Agora Docs',
        docsLabel: 'Docs',
        description:
          'Agora Docs is a protocol-inspired developer documentation surface for product docs, API reference, and AI-readable content.',
      };
}

export const appName = getAppBranding().name;
export const appDescription = getAppBranding().description;
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
