import { ChevronDownIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  type ApiReferenceCardEntry,
  type ApiReferenceCardType,
  zhCNApiReferenceCards,
} from '@/lib/api-reference-cards-data.zh-cn';
import {
  type ApiReferenceFilterOption,
  buildApiReferenceFilterOptions,
} from '@/lib/api-reference-filter-options';
import {
  API_REFERENCE_CAPABILITY_GROUPS,
  getApiReferenceProductSectionId,
} from '@/lib/api-reference-navigation';
import { cn } from '@/lib/cn';

type ApiReferenceCardsLocale = 'zh-CN';
type ApiReferenceTypeFilter = 'all' | 'client' | 'restful' | 'server';

const apiTypeLabels = {
  'client-api': '客户端 SDK',
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
    type === 'all' ? zhCNApiReferenceCards.all : zhCNApiReferenceCards[type];
  const [productId, setProductId] = useState('all');
  const [platformId, setPlatformId] = useState('all');
  const [apiType, setApiType] = useState<ApiReferenceTypeFilter>('all');
  const [filtersReady, setFiltersReady] = useState(false);

  const productOptions = useMemo(
    () => buildApiReferenceFilterOptions(entries, 'product'),
    [entries],
  );
  const platformOptions = useMemo(
    () => buildApiReferenceFilterOptions(entries, 'platform'),
    [entries],
  );
  const visibleEntries = entries.filter(
    (entry) =>
      (productId === 'all' || entry.productId === productId) &&
      (platformId === 'all' || entry.platformId === platformId) &&
      matchesApiTypeFilter(entry, apiType),
  );
  const visibleGroups = groupEntriesByProduct(visibleEntries);
  const visibleCapabilityGroups = groupProductsByCapability(visibleGroups);
  const hasFilter =
    productId !== 'all' || platformId !== 'all' || apiType !== 'all';

  useEffect(() => {
    const syncFilters = () => {
      const filters = readApiReferenceFilters(
        window.location.search,
        entries,
        type === 'all',
      );

      setProductId(filters.productId);
      setPlatformId(filters.platformId);
      setApiType(filters.apiType);
      setFiltersReady(true);
    };

    syncFilters();
    window.addEventListener('popstate', syncFilters);

    return () => window.removeEventListener('popstate', syncFilters);
  }, [entries, type]);

  useEffect(() => {
    if (!filtersReady) {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    setOptionalSearchParam(params, 'apiType', type === 'all' ? apiType : 'all');
    setOptionalSearchParam(params, 'platform', platformId);
    setOptionalSearchParam(params, 'product', productId);

    const search = params.toString();
    const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;

    window.history.replaceState(window.history.state, '', nextUrl);
  }, [apiType, filtersReady, platformId, productId, type]);

  function clearFilters() {
    setProductId('all');
    setPlatformId('all');
    setApiType('all');
  }

  return (
    <section
      className="not-prose my-8 flex flex-col gap-5"
      data-api-reference-catalog
    >
      <section aria-label="API 筛选" className="border-border border-b pb-5">
        <div className="flex flex-wrap items-end gap-4">
          <FilterSelect
            allLabel="全部产品"
            className={type === 'all' ? 'lg:hidden' : undefined}
            label="产品"
            onChange={setProductId}
            options={productOptions}
            value={productId}
          />
          <FilterSelect
            allLabel="全部平台"
            label="平台/语言"
            onChange={setPlatformId}
            options={platformOptions}
            value={platformId}
          />
          {type === 'all' ? (
            <ApiTypeSegmentedControl onChange={setApiType} value={apiType} />
          ) : null}
        </div>
      </section>

      {visibleEntries.length > 0 ? (
        <div className="flex flex-col gap-10">
          {visibleCapabilityGroups.map((capabilityGroup) => (
            <section
              aria-labelledby={`api-reference-capability-${capabilityGroup.id}`}
              className="flex flex-col gap-[18px]"
              key={capabilityGroup.id}
            >
              <h2
                className="m-0 border-border border-b pb-2.5 text-base font-semibold text-foreground"
                id={`api-reference-capability-${capabilityGroup.id}`}
              >
                {capabilityGroup.label}
              </h2>
              {capabilityGroup.products.map((group) => (
                <div
                  className="scroll-mt-40"
                  data-api-reference-product-id={group.productId}
                  id={getApiReferenceProductSectionId(group.productId)}
                  key={group.productId}
                >
                  <ApiReferenceGroup group={group} />
                </div>
              ))}
            </section>
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
    <fieldset className="flex flex-col items-start gap-1.5 text-xs font-medium text-muted-foreground">
      <legend>API 类型</legend>
      <div className="inline-flex h-8 rounded-lg bg-muted p-[3px] text-muted-foreground">
        {apiTypeOptions.map((option) => {
          const isActive = option.id === value;

          return (
            <button
              aria-pressed={isActive}
              className={[
                'rounded-md border border-transparent px-2.5 text-xs font-medium transition-all hover:text-foreground',
                isActive
                  ? 'bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30'
                  : 'text-foreground/60',
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
  allLabel = '全部',
  className,
  label,
  onChange,
  options,
  value,
}: {
  allLabel?: string;
  className?: string;
  label: string;
  onChange: (value: string) => void;
  options: ApiReferenceFilterOption[];
  value: string;
}) {
  const id = `api-reference-${label}`;

  return (
    <label
      className={cn(
        'flex flex-col items-start gap-1.5 text-xs font-medium text-muted-foreground',
        className,
      )}
    >
      <span>{label}</span>
      <span className="relative">
        <select
          className="h-8 min-w-40 appearance-none rounded-md border border-border bg-background py-1 pr-8 pl-2 text-sm font-medium text-foreground outline-none transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
          id={id}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          <option value="all">{allLabel}</option>
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

  if (group.productId === 'conversational-ai') {
    return <ConversationalAiReferenceGroup group={group} />;
  }

  const clientEntries = group.entries.filter(
    (entry) => entry.apiType === 'client-api',
  );
  const serverSdkEntries = group.entries.filter(
    (entry) => entry.apiType === 'server-sdk',
  );
  const restfulEntries = group.entries.filter(
    (entry) => entry.apiType === 'restful-api',
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

      <div className="divide-y divide-border">
        {clientEntries.length > 0 ? (
          <ApiReferenceEntrySection
            entries={clientEntries}
            title="客户端 SDK"
          />
        ) : null}
        {serverSdkEntries.length > 0 ? (
          <ApiReferenceEntrySection
            entries={serverSdkEntries}
            title="服务端 SDK"
          />
        ) : null}
        {restfulEntries.length > 0 ? (
          <ApiReferenceEntrySection
            entries={restfulEntries}
            title="RESTful API"
          />
        ) : null}
      </div>
    </section>
  );
}

function ConversationalAiReferenceGroup({
  group,
}: {
  group: ApiReferenceProductGroup;
}) {
  const clientEntries = group.entries.filter(
    (entry) => entry.apiType === 'client-api',
  );
  const serverSdkEntries = group.entries.filter(
    (entry) => entry.apiType === 'server-sdk',
  );
  const restfulEntries = group.entries.filter(
    (entry) => entry.apiType === 'restful-api',
  );

  return (
    <section className="rounded-lg border border-border bg-muted/25 p-5 sm:p-6">
      <div className="mb-5 max-w-3xl">
        <h3 className="m-0 text-lg font-semibold text-foreground">
          {group.product}
        </h3>
        <p className="m-0 mt-2 text-sm leading-6 text-muted-foreground">
          {productDescriptions[group.productId]}
        </p>
      </div>

      <div className="divide-y divide-border">
        {clientEntries.length > 0 ? (
          <ApiReferenceEntrySection
            entries={clientEntries}
            subtitle="客户端 SDK"
            title="对话式 AI Toolkit"
          />
        ) : null}
        {serverSdkEntries.length > 0 ? (
          <ApiReferenceEntrySection
            entries={serverSdkEntries}
            subtitle="服务端 SDK"
            title="Agora Agents"
          />
        ) : null}
        {restfulEntries.length > 0 ? (
          <ApiReferenceEntrySection
            entries={restfulEntries}
            title="RESTful API"
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
  const serverSdkEntries = group.entries.filter(
    (entry) => entry.apiType === 'server-sdk',
  );
  const restfulEntries = group.entries.filter(
    (entry) => entry.apiType === 'restful-api',
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

      <div className="divide-y divide-border">
        {clientEntries.length > 0 ? (
          <ApiReferenceEntrySection
            entries={clientEntries}
            headingLevel="h5"
            title="客户端 SDK"
          />
        ) : null}
        {serverSdkEntries.length > 0 ? (
          <ApiReferenceEntrySection
            entries={serverSdkEntries}
            headingLevel="h5"
            title="服务端 SDK"
          />
        ) : null}
        {restfulEntries.length > 0 ? (
          <ApiReferenceEntrySection
            entries={restfulEntries}
            headingLevel="h5"
            title="RESTful API"
          />
        ) : null}
      </div>
    </section>
  );
}

function ApiReferenceEntrySection({
  entries,
  headingLevel = 'h4',
  subtitle,
  title,
}: {
  entries: ApiReferenceCardEntry[];
  headingLevel?: 'h4' | 'h5';
  subtitle?: string;
  title: string;
}) {
  const Heading = headingLevel;

  return (
    <section className="py-5 first:pt-0 last:pb-0">
      <div className="mb-3 flex items-baseline gap-2.5">
        <Heading className="m-0 text-sm font-semibold text-foreground">
          {title}
        </Heading>
        {subtitle ? (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        ) : null}
      </div>
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
  const entryLabel = entry.label === entry.platform ? '' : ` ${entry.label}`;
  const apiTypeLabel = apiTypeLabels[entry.apiType];
  const typeLabel =
    entry.platform === apiTypeLabel || entry.label === apiTypeLabel
      ? ''
      : ` ${apiTypeLabel}`;

  return (
    <a
      aria-label={`${entry.product} ${solutionLabel}${entry.platform}${entryLabel}${typeLabel}`}
      className="group inline-flex min-h-12 max-w-full items-center gap-2.5 rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors hover:border-foreground/20 hover:bg-muted/30"
      href={entry.href}
    >
      <PlatformLabel entry={entry} />
    </a>
  );
}

function PlatformLabel({ entry }: { entry: ApiReferenceCardEntry }) {
  const iconSrc = platformIcons[entry.platformId] ?? defaultPlatformIconSrc;
  const showEntryLabel =
    entry.productId !== 'conversational-ai' && entry.label !== entry.platform;

  return (
    <span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
      <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md">
        <img
          alt=""
          aria-hidden
          className="size-7"
          loading="lazy"
          src={iconSrc}
        />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{entry.platform}</span>
        {showEntryLabel ? (
          <span className="truncate text-xs text-muted-foreground">
            {entry.label}
          </span>
        ) : null}
      </span>
    </span>
  );
}

type ApiReferenceProductGroup = {
  entries: ApiReferenceCardEntry[];
  product: string;
  productId: string;
  solutionGroups: ApiReferenceSolutionEntryGroup[];
};

type ApiReferenceVisibleCapabilityGroup = {
  id: string;
  label: string;
  products: ApiReferenceProductGroup[];
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
  c: `${platformIconBaseUrl}/c.svg`,
  cpp: `${platformIconBaseUrl}/cpp.svg`,
  csharp: `${platformIconBaseUrl}/csharp.svg`,
  electron: `${platformIconBaseUrl}/electron.svg`,
  flutter: `${platformIconBaseUrl}/flutter.svg`,
  go: `${platformIconBaseUrl}/go.svg`,
  harmonyos: `${platformIconBaseUrl}/harmonyOS.svg`,
  ios: `${platformIconBaseUrl}/ios.svg`,
  java: `${platformIconBaseUrl}/java.svg`,
  macos: `${platformIconBaseUrl}/macos.svg`,
  'mini-program': `${platformIconBaseUrl}/min-program.svg`,
  python: `${platformIconBaseUrl}/python.svg`,
  'react-native': `${platformIconBaseUrl}/react-native.svg`,
  'restful-api': `${platformIconBaseUrl}/restful.svg`,
  swift: `${platformIconBaseUrl}/ios.svg`,
  typescript: `${platformIconBaseUrl}/js.svg`,
  unity: `${platformIconBaseUrl}/unity.svg`,
  'unreal-blueprint': `${platformIconBaseUrl}/unreal-engine.svg`,
  'unreal-cpp': `${platformIconBaseUrl}/unreal-engine.svg`,
  web: `${platformIconBaseUrl}/js.svg`,
  windows: 'https://doc.shengwang.cn/img/platforms/windows.svg',
};

const apiTypeOptions: Array<{
  id: ApiReferenceTypeFilter;
  label: string;
}> = [
  { id: 'all', label: '全部' },
  { id: 'client', label: '客户端 SDK' },
  { id: 'server', label: '服务端 SDK' },
  { id: 'restful', label: 'RESTful API' },
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
  im: '一整套高可靠、低时延、高并发、安全、全球化的即时聊天云服务。',
  'local-server-recording': '在本地服务端录制实时音视频内容。',
  'media-pull': '将在线媒体流输入到实时互动频道。',
  'media-push': '将实时互动频道内容旁路推送到外部直播平台。',
  meeting: '接入智能云会议引擎的客户端能力和 RESTful API。',
  'online-ktv':
    '声网提供的线上 K 歌场景化解决方案，支持一站式灵活接入到各类娱乐社交场景中。',
  'ppt-conversion-service': '通过服务端 API 管理 PPT 转码任务。',
  'private-room': '接入私密房场景下的客户端能力。',
  rtc: '集成实时音视频互动能力，覆盖多平台客户端和服务端接口。',
  'rtc-server-sdk': '通过服务端 SDK 以服务端身份加入和管理实时互动频道。',
  'rtmp-gateway': '通过服务端 API 管理 RTMP 网关能力。',
  rtm: '接入实时消息、信令和在线状态能力。',
  'speech-to-text': '通过服务端 API 管理实时转录和翻译任务。',
  'voip-callkit': '通过服务端 API 接入微呼叫，管理呼叫和 License。',
  whiteboard: '接入互动白板客户端能力和服务端 RESTful API。',
};

function entryKey(entry: ApiReferenceCardEntry) {
  return `${entry.productId}-${entry.solutionId ?? 'default'}-${entry.platformId}-${entry.apiType}-${entry.href}`;
}

function groupProductsByCapability(
  products: ApiReferenceProductGroup[],
): ApiReferenceVisibleCapabilityGroup[] {
  const productById = new Map(
    products.map((product) => [product.productId, product]),
  );

  return API_REFERENCE_CAPABILITY_GROUPS.flatMap((capabilityGroup) => {
    const groupedProducts = capabilityGroup.productIds.flatMap((productId) => {
      const product = productById.get(productId);
      return product ? [product] : [];
    });

    return groupedProducts.length > 0
      ? [
          {
            id: capabilityGroup.id,
            label: capabilityGroup.label,
            products: groupedProducts,
          },
        ]
      : [];
  });
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

  if (filter === 'server') {
    return entry.apiType === 'server-sdk';
  }

  return entry.apiType === 'restful-api';
}

type ApiReferenceFilters = {
  apiType: ApiReferenceTypeFilter;
  platformId: string;
  productId: string;
};

function readApiReferenceFilters(
  search: string,
  entries: readonly ApiReferenceCardEntry[],
  supportsApiType: boolean,
): ApiReferenceFilters {
  const params = new URLSearchParams(search);
  const requestedProduct = params.get('product');
  const requestedPlatform = params.get('platform');
  const requestedApiType = params.get('apiType');

  return {
    apiType:
      supportsApiType &&
      (requestedApiType === 'client' ||
        requestedApiType === 'server' ||
        requestedApiType === 'restful')
        ? requestedApiType
        : 'all',
    platformId:
      requestedPlatform &&
      entries.some((entry) => entry.platformId === requestedPlatform)
        ? requestedPlatform
        : 'all',
    productId:
      requestedProduct &&
      entries.some((entry) => entry.productId === requestedProduct)
        ? requestedProduct
        : 'all',
  };
}

function setOptionalSearchParam(
  params: URLSearchParams,
  name: string,
  value: string,
) {
  if (value === 'all') {
    params.delete(name);
    return;
  }

  params.set(name, value);
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
