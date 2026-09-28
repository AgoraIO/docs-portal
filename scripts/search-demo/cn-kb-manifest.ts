import type { SearchSection } from '../../src/lib/search/kb-record';

export type CnKbManifestEntry = {
  route: string;
  reason: string;
  audience: SearchSection['audience'];
  queryIds: string[];
};

export const cnKbManifest: readonly CnKbManifestEntry[] = [
  {
    route: '/zh-CN/introduction/quickstart',
    reason: '代表入门任务、步骤说明和代码示例。',
    audience: ['developer', 'customer-support'],
    queryIds: ['quickstart-task'],
  },
  {
    route: '/zh-CN/ai/overview/product-overview',
    reason: '代表产品概念介绍和解释性正文。',
    audience: ['developer', 'customer-support'],
    queryIds: ['ai-product-overview'],
  },
  {
    route: '/zh-CN/api-reference/api-ref/conversational-ai',
    reason: '代表 API Reference、方法章节和锚点跳转。',
    audience: ['developer'],
    queryIds: ['remove-handler'],
  },
  {
    route: '/zh-CN/reference/faq/product/call_api_in_browser',
    reason: '代表 FAQ 和客服常见问题表达。',
    audience: ['developer', 'customer-support'],
    queryIds: ['call-api-in-browser'],
  },
  {
    route: '/zh-CN/realtime-media/rtc/get-started/quick-start',
    reason: '代表平台相关的快速开始和范围过滤。',
    audience: ['developer', 'customer-support'],
    queryIds: ['rtc-quick-start'],
  },
];
