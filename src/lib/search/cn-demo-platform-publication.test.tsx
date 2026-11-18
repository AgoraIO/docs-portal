import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import {
  DemoPlatform,
  DemoPlatformTabs,
} from '../../components/docs-overview/mdx-components';
import { exportPublishedCnRecords } from './cn-records.server';

it('publishes searchable headings from every Demo platform in the static HTML', async () => {
  const url = '/zh-CN/reference/demo/agora-lab';
  const html = renderToStaticMarkup(
    <DemoPlatformTabs
      defaultValue="ios"
      platforms={[
        { label: 'iOS', value: 'ios' },
        { label: 'Android', value: 'android' },
      ]}
    >
      <DemoPlatform value="ios">
        <h3 id="声网实验室-23-更新内容">声网实验室 2.3 更新内容</h3>
      </DemoPlatform>
      <DemoPlatform value="android">
        <h3 id="声网实验室-22-更新内容">声网实验室 2.2 更新内容</h3>
      </DemoPlatform>
    </DemoPlatformTabs>,
  );
  const records = await exportPublishedCnRecords({
    routes: [{ url, canonicalPath: url, markdownPath: `${url}.md` }],
    pages: [{ url, title: '声网实验室', objectType: 'docs' }],
    readMarkdown: async () =>
      '# 声网实验室\n\n### 声网实验室 2.3 更新内容 [#声网实验室-23-更新内容]\n\niOS 内容。\n\n### 声网实验室 2.2 更新内容 [#声网实验室-22-更新内容]\n\nAndroid 内容。',
    readRenderedHtml: async () => html,
  });
  expect(records.map((record) => record.url)).toEqual([
    '/reference/demo/agora-lab',
    '/reference/demo/agora-lab#声网实验室-23-更新内容',
    '/reference/demo/agora-lab#声网实验室-22-更新内容',
  ]);
});
