import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { afterEach } from 'vitest';
import type { HomeMarkdownPages } from '@/lib/home-markdown.server';
import { i18n } from '@/lib/i18n/i18n';
import { LOCALE_STORAGE_KEY } from '@/lib/i18n/i18n-config';
import { HomePage } from './HomePage';

const markdownPages: HomeMarkdownPages = {
  en: {
    'overview-home': {
      title: 'Agora Docs',
      description:
        'Conversational AI / Voice Calling / Video Calling / Interactive Live Streaming / Real-time Messaging',
      quickstartTitle: 'Get started',
      quickstartBody: 'Start with the three most important entry paths into Agora.',
      cards: [
        {
          title: 'Conversational AI quickstart',
          body: 'Start with realtime conversation, voice models, and agent integration to build your first AI interaction flow.',
          href: '/?domain=ai&page=ai-quickstart',
          icon: 'sparkles',
        },
      ],
      sections: [
        {
          title: 'What this homepage should do',
          body: 'The new homepage should act as a capability-first documentation overview.',
        },
      ],
    },
    'ai-home': {
      title: 'Conversational AI',
      description:
        'Organize AI docs around ConvoAI, Toybox, and agent workflows.',
      sections: [
        {
          title: 'Primary products',
          body: 'Today the AI surface is centered on ConvoAI and Toybox.',
        },
        {
          title: 'Suggested structure',
          body: 'Over time this domain should contain quickstarts and references.',
        },
      ],
    },
  },
  'zh-CN': {
    'overview-home': {
      title: 'Agora 文档',
      description: '对话式 AI / 语音通话 / 视频通话 / 互动直播 / 实时消息',
      quickstartTitle: 'Get started',
      quickstartBody: '从最重要的三条路径开始接入声网。',
      cards: [
        {
          title: '对话式 AI 快速开始',
          body: '从实时对话开始接入声网的 AI 能力。',
          href: '/?domain=ai&page=ai-quickstart',
          icon: 'sparkles',
        },
      ],
      sections: [
        {
          title: '新站目标',
          body: '新的首页应该是能力域优先的总览页。',
        },
      ],
    },
    'ai-home': {
      title: '对话式 AI',
      description: '围绕 ConvoAI、Toybox 和 Agent 集成组织文档。',
      sections: [
        {
          title: '主要产品',
          body: '当前 AI 相关内容主要来自 ConvoAI 和 Toybox。',
        },
        {
          title: '推荐内容结构',
          body: '建议补齐快速开始、工具调用、客户端集成和参考文档。',
        },
      ],
    },
  },
};

describe('HomePage', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
    window.localStorage.removeItem(LOCALE_STORAGE_KEY);
  });

  it('renders the overview page in english', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <HomePage
          domain="overview"
          markdownPages={markdownPages}
          page="overview-home"
        />
      </I18nextProvider>,
    );

    expect(
      screen.getByRole('heading', { name: 'Agora Docs' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Get started' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Conversational AI quickstart' }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'AI Agent' }),
    ).toHaveAttribute('href', '/?domain=ai&page=ai-home');
    expect(screen.getByText('Glossary')).toBeVisible();
    expect(screen.getByText('Security & compliance')).toBeVisible();
    expect(screen.getByText('隐私政策')).toBeVisible();
  });

  it('renders the AI domain homepage in chinese', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'zh-CN');
    await i18n.changeLanguage('zh-CN');

    render(
      <I18nextProvider i18n={i18n}>
        <HomePage domain="ai" markdownPages={markdownPages} page="ai-home" />
      </I18nextProvider>,
    );

    expect(
      await screen.findByRole('heading', { name: '对话式 AI' }),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: '主要产品' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '推荐内容结构' })).toBeVisible();
    expect(
      screen.getByRole('link', { name: '对话式 AI 快速开始' }),
    ).toHaveAttribute('href', '/?domain=ai&page=ai-quickstart');
    expect(screen.getByRole('link', { name: 'AI agent' })).toHaveAttribute(
      'href',
      '/?domain=ai&page=ai-agent',
    );
    expect(screen.getByText('隐私政策')).toBeVisible();
  });
});
