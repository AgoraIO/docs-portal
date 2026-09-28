import type { SearchSection } from '../../src/lib/search/kb-record';

export type CnKbManifestEntry = {
  route: string;
  sourcePath: string;
  reason: string;
  audience: SearchSection['audience'];
  queryIds: string[];
};

export const cnKbManifest: readonly CnKbManifestEntry[] = [
  {
    route: '/zh-CN/introduction/quickstart',
    sourcePath: 'content/docs/zh-CN/introduction/quickstart.mdx',
    reason: '代表入门任务、步骤说明和代码示例。',
    audience: ['developer', 'customer-support'],
    queryIds: ['quickstart-task'],
  },
  {
    route: '/zh-CN/ai/overview/product-overview',
    sourcePath: 'content/docs/zh-CN/ai/overview/product-overview.mdx',
    reason: '代表产品概念介绍和解释性正文。',
    audience: ['developer', 'customer-support'],
    queryIds: ['ai-product-overview'],
  },
  {
    route: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi',
    sourcePath: 'content/docs/zh-CN/api-reference/conversational-ai/web/conversationalaiapi.mdx',
    reason: '代表 API Reference、方法章节和锚点跳转。',
    audience: ['developer'],
    queryIds: ['remove-handler'],
  },
  {
    route: '/zh-CN/reference/faq/product/call_api_in_browser',
    sourcePath: 'content/docs/zh-CN/reference/faq/product/call_api_in_browser.mdx',
    reason: '代表 FAQ 和客服常见问题表达。',
    audience: ['developer', 'customer-support'],
    queryIds: ['call-api-in-browser'],
  },
  {
    route: '/zh-CN/realtime-media/rtc/get-started/quick-start',
    sourcePath: 'content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx',
    reason: '代表平台相关的快速开始和范围过滤。',
    audience: ['developer', 'customer-support'],
    queryIds: ['rtc-quick-start'],
  },
];
