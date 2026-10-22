import { createFileRoute, notFound } from '@tanstack/react-router';
import { ArrowUpRight, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { ComponentType, ReactNode } from 'react';
import { DocsCodeBlock } from '@/components/code/DocsCodeBlock';
import { HighlightedCode } from '@/components/code/HighlightedCode';
import { getMDXComponents } from '@/components/mdx';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/dev/code-blocks')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  head: () => ({
    meta: [
      { title: '代码块预览 · 声网文档中心' },
      { name: 'robots', content: 'noindex,nofollow' },
    ],
  }),
  component: CodeBlockDemo,
});

const request = `const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

// 加入频道后发布音视频轨道
await client.join(appId, channel, token, uid);
await client.publish([microphoneTrack, cameraTrack]);`;
const command = `curl --request POST \\
  'https://api.sd-rtn.com/v1/apps/<app-id>/cloud_recording/acquire' \\
  --header 'Content-Type: application/json' \\
  --header 'Authorization: Basic <credentials>' \\
  --data '{"cname":"demo","uid":"123","clientRequest":{}}'`;
const response = `{
  "cname": "demo",
  "uid": "123",
  "resourceId": "recording-resource-id"
}`;
const highlighted = `// 先确认设备权限，再加入频道
const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();
// [!code highlight:2]
await client.join(appId, channel, token, uid);
await client.publish(microphoneTrack);`;
const diff = `const options = {
  mode: "live", // [!code --]
  mode: "rtc", // [!code ++]
  codec: "vp8",
};`;
const long = `// 录制前的配置检查\n${Array.from({ length: 46 }, (_, i) => `const check${i + 1} = validateConfiguration("setting-${i + 1}");`).join('\n')}\n\nawait startRecording();`;

type TabsProps = {
  children?: ReactNode;
  value?: string;
  groupId?: string;
  defaultValue?: string;
};
const c = getMDXComponents(undefined, {
  contentPath: 'zh-CN/dev/code-blocks.mdx',
  locale: 'zh-CN',
});
const Tabs = c.CodeBlockTabs as ComponentType<TabsProps>;
const List = c.CodeBlockTabsList as ComponentType<TabsProps>;
const Trigger = c.CodeBlockTabsTrigger as ComponentType<TabsProps>;
const Panel = c.CodeBlockTab as ComponentType<TabsProps>;

function Sample({
  source,
  language = 'typescript',
  title,
  variant,
  lineIdPrefix,
}: {
  source: string;
  language?: string;
  title?: string;
  variant?: 'output' | 'terminal';
  lineIdPrefix?: string;
}) {
  return (
    <DocsCodeBlock
      source={source}
      language={language}
      title={title}
      variant={variant}
      locale="zh-CN"
    >
      <HighlightedCode
        source={source}
        language={language}
        lineIdPrefix={lineIdPrefix}
      />
    </DocsCodeBlock>
  );
}
function CodeTabs({ group, name }: { group?: string; name: string }) {
  return (
    <Tabs groupId={group} defaultValue="typescript">
      <List>
        <Trigger value="typescript">TypeScript</Trigger>
        <Trigger value="python">Python</Trigger>
        <Trigger value="java">Java</Trigger>
      </List>
      <Panel value="typescript">
        <Sample
          title={`${name}.ts`}
          source={
            'const client = createClient({ appId });\nawait client.connect();'
          }
        />
      </Panel>
      <Panel value="python">
        <Sample
          title={`${name}.py`}
          language="python"
          source={
            'client = create_client(app_id=app_id)\nawait client.connect()'
          }
        />
      </Panel>
      <Panel value="java">
        <Sample
          title={`${name}.java`}
          language="java"
          source={'Client client = new Client(appId);\nclient.connect();'}
        />
      </Panel>
    </Tabs>
  );
}
function Section({
  n,
  title,
  detail,
  children,
}: {
  n: string;
  title: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <section className="code-demo-section">
      <div className="code-demo-section-heading">
        <span>{n}</span>
        <div>
          <h2>{title}</h2>
          <p>{detail}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
function CodeBlockDemo() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === 'dark';
  return (
    <div className="code-demo" lang="zh-CN">
      <header className="code-demo-header">
        <a href="/zh-CN/introduction">
          <span>声网</span> 文档中心
        </a>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(dark ? 'light' : 'dark')}
        >
          {dark ? (
            <Sun data-icon="inline-start" />
          ) : (
            <Moon data-icon="inline-start" />
          )}
          {dark ? '切换浅色' : '切换深色'}
        </Button>
      </header>
      <main>
        <div className="code-demo-intro">
          <p>本地组件预览</p>
          <h1>代码块与示例</h1>
          <p>阅读代码、复制使用、切换示例与比较差异。</p>
          <nav aria-label="真实文档">
            <a href="/zh-CN/realtime-media/cloud-recording/get-started/quick-start">
              云端录制 <ArrowUpRight />
            </a>
            <a href="/zh-CN/realtime-media/rtc/get-started/quick-start/web">
              RTC 多平台 <ArrowUpRight />
            </a>
            <a href="/zh-CN/api-reference/api-ref/cloud-recording/start">
              OpenAPI <ArrowUpRight />
            </a>
          </nav>
        </div>
        <Section
          n="01"
          title="代码与响应"
          detail="文件名、语言与复制操作保持在标题栏。"
        >
          <div className="code-demo-grid">
            <Sample title="client.ts" source={request} />
            <Sample
              title="响应"
              variant="output"
              language="json"
              source={response}
            />
          </div>
        </Section>
        <Section
          n="02"
          title="终端命令"
          detail="长行横向滚动。复制结果保留完整命令，不包含提示符和行号。"
        >
          <Sample language="bash" source={command} />
        </Section>
        <Section
          n="03"
          title="切换示例"
          detail="下面两组明确关联，切换会同步并在刷新后保留。"
        >
          <CodeTabs group="sdk-example" name="initialize" />
          <CodeTabs group="sdk-example" name="connect" />
          <h3>独立示例</h3>
          <p>这一组与上面的示例互不联动。</p>
          <CodeTabs name="independent" />
        </Section>
        <Section
          n="04"
          title="重点行与变更"
          detail="通过底色和标记定位差异，复制内容不含展示标记。"
        >
          <div className="code-demo-grid">
            <Sample title="加入频道" source={highlighted} />
            <Sample title="配置变更" source={diff} />
          </div>
        </Section>
        <Section
          n="05"
          title="长代码"
          detail="先展示 30 行，复制始终包含全文。深链会自动展开。"
        >
          <a className="code-demo-deeplink" href="#recording-line-44">
            跳到第 44 行
          </a>
          <Sample
            title="recording-checks.ts"
            source={long}
            lineIdPrefix="recording-line"
          />
        </Section>
        <Section
          n="06"
          title="行内代码"
          detail="与正文区分，同时保留阅读节奏。"
        >
          <p className="prose">
            创建 <code>AgoraRTCClient</code> 后，调用 <code>client.join()</code>{' '}
            加入频道。可在 <code>recordingConfig</code> 中配置录制参数。
          </p>
        </Section>
      </main>
      <footer className="code-demo-footer">
        声网文档中心 · 代码块交互预览
      </footer>
    </div>
  );
}
