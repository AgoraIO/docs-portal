import { ChevronDownIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  type ApiReferenceCardEntry,
  type ApiReferenceCardType,
  zhCNApiReferenceCards,
} from './api-reference-cards-data.zh-cn';

type ApiReferenceCardsLocale = 'zh-CN';
type ApiReferenceTypeFilter = 'all' | 'client' | 'server';

const apiTypeLabels = {
  'client-api': '客户端 API',
  'restful-api': 'RESTful API',
  'server-sdk': '服务端 SDK',
} as const;

export function ApiReferenceCards({
  type,
}: {
  locale?: ApiReferenceCardsLocale;
  type: ApiReferenceCardType | 'all';
}) {
  const entries =
    type === 'all'
      ? [...zhCNApiReferenceCards.client, ...zhCNApiReferenceCards.server]
      : zhCNApiReferenceCards[type];
  const [productId, setProductId] = useState('all');
  const [platformId, setPlatformId] = useState('all');
  const [apiType, setApiType] = useState<ApiReferenceTypeFilter>('all');

  const productOptions = useMemo(
    () => buildOptions(entries, 'product'),
    [entries],
  );
  const platformOptions = useMemo(
    () => buildOptions(entries, 'platform'),
    [entries],
  );
  const visibleEntries = entries.filter(
    (entry) =>
      (productId === 'all' || entry.productId === productId) &&
      (platformId === 'all' || entry.platformId === platformId) &&
      matchesApiTypeFilter(entry, apiType),
  );
  const visibleGroups = groupEntriesByProduct(visibleEntries);
  const hasFilter =
    productId !== 'all' || platformId !== 'all' || apiType !== 'all';

  function clearFilters() {
    setProductId('all');
    setPlatformId('all');
    setApiType('all');
  }

  return (
    <section className="not-prose my-8 flex flex-col gap-4">
      <div className="flex flex-col gap-2 border-border border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterSelect
            label="产品"
            onChange={setProductId}
            options={productOptions}
            value={productId}
          />
          <FilterSelect
            label="平台/语言"
            onChange={setPlatformId}
            options={platformOptions}
            value={platformId}
          />
          {type === 'all' ? (
            <ApiTypeSegmentedControl onChange={setApiType} value={apiType} />
          ) : null}
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {visibleEntries.length} / {entries.length}
        </span>
      </div>

      {visibleEntries.length > 0 ? (
        <div className="flex flex-col gap-6">
          {visibleGroups.map((group) => (
            <ApiReferenceGroup group={group} key={group.productId} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card px-4 py-5">
          <p className="m-0 text-sm font-medium text-foreground">
            没有匹配的 API 文档
          </p>
          <p className="m-0 mt-1 text-sm text-muted-foreground">
            调整产品或平台筛选条件后重试。
          </p>
          {hasFilter ? (
            <button
              className="mt-3 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent/40"
              onClick={clearFilters}
              type="button"
            >
              清除筛选
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}

function ApiTypeSegmentedControl({
  onChange,
  value,
}: {
  onChange: (value: ApiReferenceTypeFilter) => void;
  value: ApiReferenceTypeFilter;
}) {
  return (
    <fieldset className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
      <legend className="contents">API 类型</legend>
      <div className="inline-flex h-8 rounded-md border border-border bg-muted/50 p-0.5">
        {apiTypeOptions.map((option) => {
          const isActive = option.id === value;

          return (
            <button
              aria-pressed={isActive}
              className={[
                'rounded-[5px] px-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:bg-background/80 hover:text-foreground',
              ].join(' ')}
              key={option.id}
              onClick={() => onChange(option.id)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  value: string;
}) {
  const id = `api-reference-${label}`;

  return (
    <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      <span className="relative">
        <select
          className="h-8 min-w-36 appearance-none rounded-md border border-border bg-background py-1 pr-8 pl-2 text-sm font-medium text-foreground outline-none transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
          id={id}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          <option value="all">全部</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-muted-foreground" />
      </span>
    </label>
  );
}

function ApiReferenceGroup({ group }: { group: ApiReferenceProductGroup }) {
  if (group.solutionGroups.some((solutionGroup) => solutionGroup.isExplicit)) {
    return <ApiReferenceSolutionGroup group={group} />;
  }

  const clientEntries = group.entries.filter(
    (entry) => entry.apiType === 'client-api',
  );
  const serverEntries = group.entries.filter(
    (entry) =>
      entry.apiType === 'server-sdk' || entry.apiType === 'restful-api',
  );

  return (
    <section className="rounded-lg border border-border bg-muted/25 p-5 sm:p-6">
      <div className="mb-5 max-w-3xl">
        <h3 className="m-0 text-lg font-semibold text-foreground">
          {group.product}
        </h3>
        <p className="m-0 mt-2 text-sm leading-6 text-muted-foreground">
          {productDescriptions[group.productId] ??
            '选择对应平台或语言，打开该产品的 API 参考。'}
        </p>
      </div>

      <div className="space-y-6">
        {clientEntries.length > 0 ? (
          <ApiReferenceEntrySection
            entries={clientEntries}
            title="客户端 API"
          />
        ) : null}
        {serverEntries.length > 0 ? (
          <ApiReferenceEntrySection
            entries={serverEntries}
            title="服务端 API"
          />
        ) : null}
      </div>
    </section>
  );
}

function ApiReferenceSolutionGroup({
  group,
}: {
  group: ApiReferenceProductGroup;
}) {
  return (
    <section className="rounded-lg border border-border bg-muted/25 p-5 sm:p-6">
      <div className="mb-5 max-w-3xl">
        <h3 className="m-0 text-lg font-semibold text-foreground">
          {group.product}
        </h3>
        <p className="m-0 mt-2 text-sm leading-6 text-muted-foreground">
          {productDescriptions[group.productId] ??
            '选择对应方案、平台或语言，打开该产品的 API 参考。'}
        </p>
      </div>

      <div className="space-y-4">
        {group.solutionGroups.map((solutionGroup) => (
          <ApiReferenceSolutionCard
            group={solutionGroup}
            key={solutionGroup.id}
            productId={group.productId}
          />
        ))}
      </div>
    </section>
  );
}

function ApiReferenceSolutionCard({
  group,
  productId,
}: {
  group: ApiReferenceSolutionEntryGroup;
  productId: string;
}) {
  const clientEntries = group.entries.filter(
    (entry) => entry.apiType === 'client-api',
  );
  const serverEntries = group.entries.filter(
    (entry) =>
      entry.apiType === 'server-sdk' || entry.apiType === 'restful-api',
  );

  return (
    <section
      aria-labelledby={`${productId}-${group.id}-heading`}
      className="rounded-lg border border-border bg-background p-4 sm:p-5"
    >
      <div className="mb-5">
        <h4
          className="m-0 text-base font-semibold text-foreground"
          id={`${productId}-${group.id}-heading`}
        >
          {group.title}
        </h4>
        {group.description ? (
          <p className="m-0 mt-2 text-sm leading-6 text-muted-foreground">
            {group.description}
          </p>
        ) : null}
      </div>

      <div className="space-y-6">
        {clientEntries.length > 0 ? (
          <ApiReferenceEntrySection
            entries={clientEntries}
            headingLevel="h5"
            title="客户端 API"
          />
        ) : null}
        {serverEntries.length > 0 ? (
          <ApiReferenceEntrySection
            entries={serverEntries}
            headingLevel="h5"
            title="服务端 API"
          />
        ) : null}
      </div>
    </section>
  );
}

function ApiReferenceEntrySection({
  entries,
  headingLevel = 'h4',
  title,
}: {
  entries: ApiReferenceCardEntry[];
  headingLevel?: 'h4' | 'h5';
  title: string;
}) {
  const Heading = headingLevel;

  return (
    <section>
      <Heading className="m-0 mb-3 text-sm font-semibold text-foreground">
        {title}
      </Heading>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <ApiReferenceChip entry={entry} key={entryKey(entry)} />
        ))}
      </div>
    </section>
  );
}

function ApiReferenceChip({ entry }: { entry: ApiReferenceCardEntry }) {
  const solutionLabel = entry.solutionTitle ? `${entry.solutionTitle} ` : '';

  return (
    <a
      aria-label={`${entry.product} ${solutionLabel}${entry.platform} ${apiTypeLabels[entry.apiType]}`}
      className="group inline-flex min-h-14 max-w-full items-center gap-3 rounded-md border border-border bg-background px-3.5 py-2.5 text-sm transition-colors hover:border-foreground/20 hover:bg-background/80"
      href={entry.href}
    >
      <PlatformLabel entry={entry} />
    </a>
  );
}

function PlatformLabel({ entry }: { entry: ApiReferenceCardEntry }) {
  const iconSrc = platformIcons[entry.platformId] ?? defaultPlatformIconSrc;

  return (
    <span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
      <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
        <img
          alt=""
          aria-hidden
          className="size-8"
          loading="lazy"
          src={iconSrc}
        />
      </span>
      <span className="truncate text-sm font-medium">{entry.platform}</span>
    </span>
  );
}

type FilterOption = {
  id: string;
  label: string;
};

type ApiReferenceProductGroup = {
  entries: ApiReferenceCardEntry[];
  product: string;
  productId: string;
  solutionGroups: ApiReferenceSolutionEntryGroup[];
};

type ApiReferenceSolutionEntryGroup = {
  description?: string;
  entries: ApiReferenceCardEntry[];
  id: string;
  isExplicit: boolean;
  title: string;
};

const platformIconBaseUrl =
  'https://assets-docs.agora.io/images/api-reference/platforms';

const defaultPlatformIconSrc = `${platformIconBaseUrl}/all.svg`;

const platformIcons: Record<string, string> = {
  android: `${platformIconBaseUrl}/android.svg`,
  cpp: `${platformIconBaseUrl}/cpp.svg`,
  csharp: `${platformIconBaseUrl}/csharp.svg`,
  electron: `${platformIconBaseUrl}/electron.svg`,
  flutter: `${platformIconBaseUrl}/flutter.svg`,
  go: `${platformIconBaseUrl}/go.svg`,
  harmonyos: `${platformIconBaseUrl}/harmonyOS.svg`,
  ios: `${platformIconBaseUrl}/ios.svg`,
  java: `${platformIconBaseUrl}/java.svg`,
  macos: `${platformIconBaseUrl}/macos.svg`,
  python: `${platformIconBaseUrl}/python.svg`,
  'react-native': `${platformIconBaseUrl}/react-native.svg`,
  'restful-api': `${platformIconBaseUrl}/restful.svg`,
  swift: `${platformIconBaseUrl}/ios.svg`,
  typescript: `${platformIconBaseUrl}/js.svg`,
  unity: `${platformIconBaseUrl}/unity.svg`,
  'unreal-blueprint': `${platformIconBaseUrl}/unreal-engine.svg`,
  'unreal-cpp': `${platformIconBaseUrl}/unreal-engine.svg`,
  web: `${platformIconBaseUrl}/js.svg`,
};

const apiTypeOptions: Array<{
  id: ApiReferenceTypeFilter;
  label: string;
}> = [
  { id: 'all', label: '全部' },
  { id: 'client', label: '客户端 API' },
  { id: 'server', label: '服务端 API' },
];

const productDescriptions: Record<string, string> = {
  analytics: '查看质量、用量和业务分析相关的服务端 API。',
  'cloud-recording': '录制实时音视频内容，并管理录制任务与文件输出。',
  'cloud-transcoding': '通过服务端 API 管理云端转码任务。',
  console: '通过控制台 API 管理项目、用量和账号相关能力。',
  'conversational-ai': '接入对话式 AI 引擎，构建实时语音智能体体验。',
  danmaku: '通过服务端 API 接入弹幕玩法相关能力。',
  'flexible-classroom': '接入在线课堂场景，管理课堂、互动和配套服务。',
  'fusion-cdn': '管理融合 CDN 直播相关服务端能力。',
  'local-server-recording': '在本地服务端录制实时音视频内容。',
  'media-pull': '将在线媒体流输入到实时互动频道。',
  'media-push': '将实时互动频道内容旁路推送到外部直播平台。',
  meeting: '接入会议场景下的客户端能力。',
  'online-ktv':
    '声网提供的线上 K 歌场景化解决方案，支持一站式灵活接入到各类娱乐社交场景中。',
  'ppt-conversion-service': '通过服务端 API 管理 PPT 转码任务。',
  'private-room': '接入私密房场景下的客户端能力。',
  rtc: '集成实时音视频互动能力，覆盖多平台客户端和服务端接口。',
  'rtc-server-sdk': '通过服务端 SDK 以服务端身份加入和管理实时互动频道。',
  'rtmp-gateway': '通过服务端 API 管理 RTMP 网关能力。',
  rtm: '接入实时消息、信令和在线状态能力。',
  'speech-to-text': '通过服务端 API 管理实时转录和翻译任务。',
  'voip-callkit': '通过服务端 API 接入 VoIP 呼叫服务。',
  whiteboard: '接入互动白板客户端能力和服务端 RESTful API。',
};

function buildOptions(
  entries: readonly ApiReferenceCardEntry[],
  kind: 'platform' | 'product',
): FilterOption[] {
  const seen = new Set<string>();
  const options: FilterOption[] = [];

  for (const entry of entries) {
    const id = kind === 'product' ? entry.productId : entry.platformId;
    const label = kind === 'product' ? entry.product : entry.platform;

    if (seen.has(id)) {
      continue;
    }

    seen.add(id);
    options.push({ id, label });
  }

  return options;
}

function entryKey(entry: ApiReferenceCardEntry) {
  return `${entry.productId}-${entry.solutionId ?? 'default'}-${entry.platformId}-${entry.apiType}-${entry.href}`;
}

function matchesApiTypeFilter(
  entry: ApiReferenceCardEntry,
  filter: ApiReferenceTypeFilter,
) {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'client') {
    return entry.apiType === 'client-api';
  }

  return entry.apiType === 'server-sdk' || entry.apiType === 'restful-api';
}

function groupEntriesByProduct(
  entries: readonly ApiReferenceCardEntry[],
): ApiReferenceProductGroup[] {
  const groups: ApiReferenceProductGroup[] = [];
  const groupByProductId = new Map<string, ApiReferenceProductGroup>();

  for (const entry of entries) {
    let group = groupByProductId.get(entry.productId);

    if (!group) {
      group = {
        entries: [],
        product: entry.product,
        productId: entry.productId,
        solutionGroups: [],
      };
      groupByProductId.set(entry.productId, group);
      groups.push(group);
    }

    group.entries.push(entry);
  }

  for (const group of groups) {
    group.solutionGroups = groupEntriesBySolution(group.entries);
  }

  return groups;
}

function groupEntriesBySolution(
  entries: readonly ApiReferenceCardEntry[],
): ApiReferenceSolutionEntryGroup[] {
  const groups: ApiReferenceSolutionEntryGroup[] = [];
  const groupBySolutionId = new Map<string, ApiReferenceSolutionEntryGroup>();

  for (const entry of entries) {
    const id = entry.solutionId ?? 'default';
    let group = groupBySolutionId.get(id);

    if (!group) {
      group = {
        description: entry.solutionDescription,
        entries: [],
        id,
        isExplicit: Boolean(entry.solutionTitle),
        title: entry.solutionTitle ?? 'API 参考',
      };
      groupBySolutionId.set(id, group);
      groups.push(group);
    }

    group.entries.push(entry);
  }

  return groups;
}
