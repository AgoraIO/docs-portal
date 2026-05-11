import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/lib/i18n/i18n';
import { PortalSidebar } from './PortalSidebar';

const docsTab = {
  docs: [
    {
      description: '文档指引',
      markdownUrl: '/llms.mdx/docs/convoai/restful/landing-page.md',
      pageKey: 'landing-page',
      path: 'docs/convoai/restful/landing-page.mdx',
      routePath: '/docs/convoai/restful/landing-page',
      title: '文档指引',
    },
    {
      description: '开通服务',
      markdownUrl: '/llms.mdx/docs/convoai/restful/get-started/enable-service.md',
      pageKey: 'get-started/enable-service',
      path: 'docs/convoai/restful/get-started/enable-service.mdx',
      routePath: '/docs/convoai/restful/get-started/enable-service',
      title: '开通服务',
    },
    {
      description: '快速开始',
      markdownUrl: '/llms.mdx/docs/convoai/restful/get-started/quick-start.md',
      pageKey: 'get-started/quick-start',
      path: 'docs/convoai/restful/get-started/quick-start.mdx',
      routePath: '/docs/convoai/restful/get-started/quick-start',
      title: '使用 RESTful API 实现对话式 AI 引擎',
    },
    {
      description: 'Go 快速开始',
      markdownUrl: '/llms.mdx/docs/convoai/restful/get-started/quick-start-go.md',
      pageKey: 'get-started/quick-start-go',
      path: 'docs/convoai/restful/get-started/quick-start-go.mdx',
      routePath: '/docs/convoai/restful/get-started/quick-start-go',
      title: '通过 Go 服务端快速开始',
    },
    {
      description: '产品概览',
      markdownUrl: '/llms.mdx/docs/convoai/restful/overview/product-overview.md',
      pageKey: 'overview/product-overview',
      path: 'docs/convoai/restful/overview/product-overview.mdx',
      routePath: '/docs/convoai/restful/overview/product-overview',
      title: '产品概览',
    },
    {
      description: '概念',
      markdownUrl: '/llms.mdx/docs/convoai/restful/overview/concepts.md',
      pageKey: 'overview/concepts',
      path: 'docs/convoai/restful/overview/concepts.mdx',
      routePath: '/docs/convoai/restful/overview/concepts',
      title: '关键概念',
    },
    {
      description: '自定义大模型',
      markdownUrl: '/llms.mdx/docs/convoai/restful/user-guides/custom-llm.md',
      pageKey: 'user-guides/custom-llm',
      path: 'docs/convoai/restful/user-guides/custom-llm.mdx',
      routePath: '/docs/convoai/restful/user-guides/custom-llm',
      title: '接入自定义大模型',
    },
    {
      description: '音频设置',
      markdownUrl: '/llms.mdx/docs/convoai/restful/best-practice/audio-settings.md',
      pageKey: 'best-practice/audio-settings',
      path: 'docs/convoai/restful/best-practice/audio-settings.mdx',
      routePath: '/docs/convoai/restful/best-practice/audio-settings',
      title: '音频设置建议',
    },
  ],
  key: 'docs',
  label: '文档',
} as const;

describe('PortalSidebar', () => {
  it('renders grouped sidebar content with nested items and active state', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <PortalSidebar
          activeDoc={docsTab.docs[2]}
          activeTab={docsTab as never}
        />
      </I18nextProvider>,
    );

    expect(screen.getByText('Get Started')).toBeVisible();
    expect(screen.getByText('Product & Concepts')).toBeVisible();
    expect(screen.getByText('Agent Capabilities')).toBeVisible();
    expect(screen.getByText('Quickstart')).toBeVisible();
    expect(screen.getByText('Go Server Quickstart')).toHaveClass(
      'text-muted-foreground',
    );
    expect(screen.getByRole('button', { name: '切换快速接入' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    const activeLink = screen.getByRole('link', {
      name: '使用 RESTful API 实现对话式 AI 引擎',
    });
    expect(activeLink).toHaveAttribute(
      'href',
      '/?domain=docs&page=get-started/quick-start',
    );
    expect(activeLink).toBeVisible();
  });
});
