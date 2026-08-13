import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ID = 494535;
const POSTHOG_API = `https://us.posthog.com/api/projects/${PROJECT_ID}/query/`;
const PRODUCTION_HOST = 'docs.agora.io';
const SCHEMA_VERSION = 3;
const DEFAULT_POLICY_VERSION = '2026-08-06';
const WINDOW_DAYS = 28;
const DEFAULT_EVENT_HEALTH_DAYS = 7;
const STRUCTURED_EVENTS = [
  'docs_page_viewed',
  'docs_journey_step',
  'docs_search_opened',
  'docs_search_completed',
  'docs_search_result_clicked',
  'docs_code_copied',
  'docs_code_tab_changed',
  'docs_toc_clicked',
  'docs_platform_changed',
  'docs_link_clicked',
  'docs_feedback_opened',
  'docs_feedback_issue_clicked',
];
const DEFAULT_REMEDIATION_TARGETS = {
  analytics: 'src/lib/analytics/posthog.ts',
  performance: 'src/routes/$locale/$tab/$.tsx',
  redirects: 'src/lib/legacy-sitemap/redirects.json',
  routeHandler: 'src/routes/$locale/$tab/$.tsx',
};

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = dirname(scriptPath);
const repoRoot = resolve(scriptDir, '../..');
const defaultReportsDir = resolve(
  repoRoot,
  '.agents/local/docs-quality/reports',
);

export function percentile(values, proportion) {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.max(0, Math.ceil(proportion * sorted.length) - 1);
  return sorted[index];
}

export function classifyPage(metrics, baselines) {
  if (metrics.sessions < 30) {
    return {
      evidenceLevel: 'insufficient',
      negativeSignals: [],
      signalEvidence: [],
      status: 'insufficient-evidence',
    };
  }

  const negativeSignals = [];
  const signalEvidence = [];
  if (
    baselines.rageSessionRateP80 !== null &&
    metrics.rageSessionRate > baselines.rageSessionRateP80
  ) {
    negativeSignals.push('task-friction');
    signalEvidence.push({
      comparison: 'above',
      metric: 'rageSessionRate',
      signal: 'task-friction',
      threshold: baselines.rageSessionRateP80,
      value: metrics.rageSessionRate,
    });
  }
  if (
    metrics.feedbackVotes >= 10 &&
    metrics.helpfulRate !== null &&
    baselines.helpfulRateP20 !== null &&
    metrics.helpfulRate < baselines.helpfulRateP20
  ) {
    negativeSignals.push('satisfaction');
    signalEvidence.push({
      comparison: 'below',
      metric: 'helpfulRate',
      signal: 'satisfaction',
      threshold: baselines.helpfulRateP20,
      value: metrics.helpfulRate,
    });
  }
  const technicalEvidence = [
    ['lcpP75', metrics.lcpP75, 2_500],
    ['inpP75', metrics.inpP75, 500],
    ['fcpP75', metrics.fcpP75, 3_000],
  ]
    .filter(([, value, threshold]) => value !== null && value > threshold)
    .map(([metric, value, threshold]) => ({
      comparison: 'above',
      metric,
      signal: 'technical-experience',
      threshold,
      value,
    }));
  if (technicalEvidence.length > 0) {
    negativeSignals.push('technical-experience');
    signalEvidence.push(...technicalEvidence);
  }

  if (metrics.sessions < 100) {
    return {
      evidenceLevel: 'directional',
      negativeSignals,
      signalEvidence,
      status: 'watch',
    };
  }

  return {
    evidenceLevel: 'full',
    negativeSignals,
    signalEvidence,
    status:
      negativeSignals.length >= 2
        ? 'needs-improvement'
        : negativeSignals.length === 1
          ? 'watch'
          : 'healthy',
  };
}

export function buildWindows(
  asOf,
  eventHealthDays = DEFAULT_EVENT_HEALTH_DAYS,
) {
  const end = requireIsoTimestamp(asOf);
  const endMs = new Date(end).getTime();
  const dayMs = 24 * 60 * 60 * 1_000;
  return {
    current: {
      end,
      start: new Date(endMs - WINDOW_DAYS * dayMs).toISOString(),
      windowDays: WINDOW_DAYS,
    },
    eventHealth: {
      end,
      start: new Date(endMs - eventHealthDays * dayMs).toISOString(),
      windowDays: eventHealthDays,
    },
    previous: {
      end: new Date(endMs - WINDOW_DAYS * dayMs).toISOString(),
      start: new Date(endMs - WINDOW_DAYS * 2 * dayMs).toISOString(),
      windowDays: WINDOW_DAYS,
    },
    previousEventHealth: {
      end: new Date(endMs - eventHealthDays * dayMs).toISOString(),
      start: new Date(endMs - eventHealthDays * 2 * dayMs).toISOString(),
      windowDays: eventHealthDays,
    },
  };
}

export function evaluateDataHealth(range, asOf, maxAgeHours = 48) {
  const earliestEvent = range?.earliest_event ?? null;
  const latestEvent = range?.latest_event ?? null;
  if (!latestEvent || Number.isNaN(new Date(latestEvent).getTime())) {
    return {
      ageHours: null,
      decisionAuthorized: false,
      earliestEvent,
      latestEvent,
      maxAgeHours,
      status: 'stale',
    };
  }

  const ageHours = Math.max(
    0,
    (new Date(asOf).getTime() - new Date(latestEvent).getTime()) /
      (60 * 60 * 1_000),
  );
  const status = ageHours <= maxAgeHours ? 'healthy' : 'stale';
  return {
    ageHours,
    decisionAuthorized: status === 'healthy',
    earliestEvent,
    latestEvent,
    maxAgeHours,
    status,
  };
}

export function evaluateInstrumentation({
  asOf,
  config,
  currentEvents,
  currentSessions,
  previousEvents,
}) {
  const deployedAt = config?.deployedAt ?? null;
  const gracePeriodDays = config?.gracePeriodDays ?? 7;
  const minimumSessions = config?.minimumSessions ?? 100;
  const minimumPreviousEvents = config?.minimumPreviousEvents ?? 20;
  const degradationRatio = config?.degradationRatio ?? 0.5;
  const currentTotal = sumEventCounts(currentEvents);
  const previousTotal = sumEventCounts(previousEvents);

  if (
    !deployedAt ||
    new Date(deployedAt).getTime() > new Date(asOf).getTime()
  ) {
    return {
      currentTotal,
      deployedAt,
      previousTotal,
      status: 'not-deployed',
    };
  }

  const ageDays =
    (new Date(asOf).getTime() - new Date(deployedAt).getTime()) /
    (24 * 60 * 60 * 1_000);
  if (ageDays <= gracePeriodDays) {
    return {
      currentTotal,
      deployedAt,
      previousTotal,
      status: 'warming-up',
    };
  }
  if (currentTotal === 0 && currentSessions >= minimumSessions) {
    return {
      currentTotal,
      deployedAt,
      previousTotal,
      status: 'instrumentation-failure',
    };
  }
  if (currentTotal === 0) {
    return {
      currentTotal,
      deployedAt,
      previousTotal,
      status: 'insufficient-evidence',
    };
  }
  if (
    previousTotal >= minimumPreviousEvents &&
    currentTotal / previousTotal < degradationRatio
  ) {
    return {
      currentTotal,
      deployedAt,
      previousTotal,
      status: 'instrumentation-degraded',
    };
  }

  return {
    currentTotal,
    deployedAt,
    previousTotal,
    status: 'healthy',
  };
}

export function buildRiskLifecycle(currentRisks, previousReport, asOf) {
  const previousRisks = previousReport?.risks ?? [];
  const activePrevious = new Map(
    previousRisks
      .filter((risk) => risk.lifecycle !== 'resolved')
      .map((risk) => [risk.id, risk]),
  );
  const currentIds = new Set(currentRisks.map((risk) => risk.id));
  const active = currentRisks.map((risk) => {
    const previous = activePrevious.get(risk.id);
    return {
      ...risk,
      firstSeen: previous?.firstSeen ?? asOf,
      lastSeen: asOf,
      lifecycle: previous ? 'ongoing' : 'new',
      occurrences: (previous?.occurrences ?? 0) + 1,
    };
  });
  const resolved = Array.from(activePrevious.values())
    .filter((risk) => !currentIds.has(risk.id))
    .map((risk) => ({
      ...risk,
      lifecycle: 'resolved',
      resolvedAt: asOf,
    }));
  return [...active, ...resolved];
}

export function buildComparison({
  available,
  currentPages,
  currentJourneys,
  currentTotals,
  previousJourneys,
  previousPages,
  previousTotals,
}) {
  if (!available) {
    return {
      available: false,
      pageStatusChanges: [],
      reason: 'The previous 28-day window is incomplete.',
      totals: null,
    };
  }

  const previousByPath = new Map(
    previousPages.map((page) => [page.pathname, page]),
  );
  const pageStatusChanges = currentPages
    .map((page) => {
      const previous = previousByPath.get(page.pathname);
      if (!previous || previous.status === page.status) {
        return null;
      }
      return {
        currentStatus: page.status,
        pathname: page.pathname,
        previousStatus: previous.status,
      };
    })
    .filter(Boolean);

  return {
    available: true,
    pageStatusChanges,
    reason: null,
    totals: {
      pageviews: metricDelta(currentTotals.pageviews, previousTotals.pageviews),
      sessions: metricDelta(currentTotals.sessions, previousTotals.sessions),
    },
    topJourneyPathChanges: compareJourneyPaths(
      currentJourneys?.topPaths ?? [],
      previousJourneys?.topPaths ?? [],
    ),
  };
}

export function normalizeAgentBenchmarkSummary(summary, integrity, source) {
  if (
    !summary?.batchId ||
    !summary?.taskId ||
    !summary?.completedAt ||
    !summary?.overall ||
    !summary?.byVendor ||
    integrity.validResults !== summary.overall.total
  ) {
    return null;
  }

  return {
    batchId: summary.batchId,
    byVendor: summary.byVendor,
    completedAt: summary.completedAt,
    integrity: `${integrity.validResults}/${summary.overall.total} Executor and ${integrity.validResults}/${summary.overall.total} Judge results valid`,
    overall: summary.overall,
    source,
    taskId: summary.taskId,
    validCompletedBatches: 1,
  };
}

export function selectLatestBenchmarks(batches) {
  const latestByTask = new Map();
  for (const batch of batches) {
    const current = latestByTask.get(batch.taskId);
    if (
      !current ||
      new Date(batch.completedAt).getTime() >
        new Date(current.completedAt).getTime()
    ) {
      latestByTask.set(batch.taskId, batch);
    }
  }
  return Array.from(latestByTask.values()).sort((left, right) =>
    left.taskId.localeCompare(right.taskId),
  );
}

export function reportPeriod(reportType, asOf) {
  const date = new Date(requireIsoTimestamp(asOf));
  if (reportType === 'monthly') {
    return date.toISOString().slice(0, 7);
  }
  if (reportType !== 'weekly') {
    throw new Error(`Unsupported report type: ${reportType}`);
  }

  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate - yearStart) / 86_400_000 + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function assertReportPrivacy(text) {
  if (/POSTHOG_PERSONAL_API_KEY|Authorization:\s*Bearer/i.test(text)) {
    throw new Error(
      'Privacy validation failed: generated report contains secret material.',
    );
  }
}

export function buildDocSourceIndex(sourceFiles) {
  const index = new Map();
  for (const sourceFile of sourceFiles) {
    const normalized = sourceFile.split(sep).join('/');
    const match = normalized.match(/^content\/docs\/en\/(.+)\.(?:md|mdx)$/);
    if (!match || match[1].split('/').some((part) => part.startsWith('_'))) {
      continue;
    }
    const routeParts = match[1]
      .split('/')
      .filter((part) => !/^\(.+\)$/.test(part));
    if (routeParts.at(-1) === 'index') {
      routeParts.pop();
    }
    const route = `/en/${routeParts.join('/')}`.replace(/\/$/, '');
    const existing = index.get(route);
    if (existing && existing !== normalized) {
      throw new Error(
        `Multiple documentation sources map to ${route}: ${existing}, ${normalized}`,
      );
    }
    index.set(route, normalized);
  }
  return index;
}

export function attachPageSources(pages, sourceIndex) {
  return pages.map((page) => {
    const sourceFile = page.sourceFile ?? sourceIndex.get(page.pathname);
    if (!sourceFile) {
      throw new Error(
        `No repository source file maps to monitored route ${page.pathname}`,
      );
    }
    return { ...page, sourceFile };
  });
}

export function buildRemediationBacklog({
  dataHealth,
  instrumentation,
  pages,
  remediationTargets = DEFAULT_REMEDIATION_TARGETS,
  risks,
}) {
  const pagesByPath = new Map(pages.map((page) => [page.pathname, page]));
  const backlog = [];

  for (const risk of risks.filter((item) => item.lifecycle !== 'resolved')) {
    if (risk.kind === 'page-quality') {
      const page = pagesByPath.get(risk.pathname);
      if (!page?.sourceFile) {
        throw new Error(
          `Page-quality risk ${risk.id} has no repository source file`,
        );
      }
      backlog.push(buildDocsRemediationItem(risk, page));
      if (page.negativeSignals.includes('technical-experience')) {
        backlog.push(
          buildPerformanceRemediationItem(risk, page, remediationTargets),
        );
      }
      continue;
    }
    if (risk.kind === 'route-health') {
      backlog.push(buildRouteRemediationItem(risk, remediationTargets));
      continue;
    }
    if (risk.kind === 'data-health') {
      backlog.push(
        buildDataRemediationItem(risk, dataHealth, remediationTargets),
      );
      continue;
    }
    if (risk.kind === 'instrumentation') {
      backlog.push(
        buildInstrumentationRemediationItem(
          risk,
          instrumentation,
          remediationTargets,
        ),
      );
      continue;
    }
    throw new Error(`Unsupported remediation risk kind: ${risk.kind}`);
  }

  return backlog.sort(compareRemediationItems);
}

export function summarizeRemediationBacklog(backlog) {
  return {
    byOwner: countBy(backlog, (item) => item.owner),
    byStatus: countBy(backlog, (item) => item.status),
    total: backlog.length,
  };
}

export function assertRemediationBacklog(report) {
  if (
    !Number.isInteger(report.schemaVersion) ||
    report.schemaVersion < SCHEMA_VERSION
  ) {
    throw new Error(`schemaVersion must be ${SCHEMA_VERSION} or later`);
  }
  if (!Array.isArray(report.remediationBacklog)) {
    throw new Error('remediationBacklog must be an array');
  }
  const requiredStrings = [
    'confidence',
    'diagnosis',
    'id',
    'owner',
    'priority',
    'proposedChange',
    'riskId',
    'route',
    'sourceFile',
    'status',
    'userImpact',
  ];
  const allowedStatuses = new Set([
    'ready',
    'needs-validation',
    'external-owner',
  ]);
  const allowedOwners = new Set(['docs', 'frontend', 'analytics']);
  const allowedPriorities = new Set(['P0', 'P1', 'P2', 'P3']);
  const allowedConfidence = new Set(['low', 'medium', 'high']);

  for (const item of report.remediationBacklog) {
    for (const field of requiredStrings) {
      if (typeof item[field] !== 'string' || item[field].trim() === '') {
        throw new Error(
          `Remediation item ${item.id ?? '<unknown>'} needs ${field}`,
        );
      }
    }
    if (!/^\/en(?:\/[A-Za-z0-9_./-]*)?$/.test(item.route)) {
      throw new Error(`Remediation item ${item.id} has an invalid route`);
    }
    if (
      item.sourceFile.startsWith('/') ||
      item.sourceFile.split('/').includes('..')
    ) {
      throw new Error(`Remediation item ${item.id} has an unsafe sourceFile`);
    }
    if (!allowedStatuses.has(item.status)) {
      throw new Error(`Remediation item ${item.id} has an invalid status`);
    }
    if (!allowedOwners.has(item.owner)) {
      throw new Error(`Remediation item ${item.id} has an invalid owner`);
    }
    if (!allowedPriorities.has(item.priority)) {
      throw new Error(`Remediation item ${item.id} has an invalid priority`);
    }
    if (!allowedConfidence.has(item.confidence)) {
      throw new Error(`Remediation item ${item.id} has invalid confidence`);
    }
    if (
      !item.evidence ||
      typeof item.evidence !== 'object' ||
      Array.isArray(item.evidence) ||
      Object.keys(item.evidence).length === 0
    ) {
      throw new Error(`Remediation item ${item.id} needs evidence`);
    }
    if (
      !Array.isArray(item.acceptanceCriteria) ||
      !item.acceptanceCriteria.length ||
      item.acceptanceCriteria.some(
        (criterion) => typeof criterion !== 'string' || criterion.trim() === '',
      )
    ) {
      throw new Error(`Remediation item ${item.id} needs acceptanceCriteria`);
    }
    if (
      !Array.isArray(item.verification) ||
      !item.verification.length ||
      item.verification.some(
        (method) => typeof method !== 'string' || method.trim() === '',
      )
    ) {
      throw new Error(`Remediation item ${item.id} needs verification`);
    }
  }

  for (const risk of (report.risks ?? []).filter(
    (item) => item.lifecycle !== 'resolved',
  )) {
    if (!report.remediationBacklog.some((item) => item.riskId === risk.id)) {
      throw new Error(`Active risk ${risk.id} has no remediation item`);
    }
  }

  assertRemediationSummary(
    report.remediationSummary,
    summarizeRemediationBacklog(report.remediationBacklog),
  );
}

function assertRemediationSummary(actual, expected) {
  if (!actual || typeof actual !== 'object' || Array.isArray(actual)) {
    throw new Error('remediationSummary must be an object');
  }
  if (actual.total !== expected.total) {
    throw new Error('remediationSummary total does not match the backlog');
  }
  for (const dimension of ['byOwner', 'byStatus']) {
    const actualCounts = actual[dimension];
    const expectedCounts = expected[dimension];
    if (
      !actualCounts ||
      typeof actualCounts !== 'object' ||
      Array.isArray(actualCounts)
    ) {
      throw new Error(`remediationSummary ${dimension} must be an object`);
    }
    const keys = new Set([
      ...Object.keys(actualCounts),
      ...Object.keys(expectedCounts),
    ]);
    if (
      Array.from(keys).some((key) => actualCounts[key] !== expectedCounts[key])
    ) {
      throw new Error(
        `remediationSummary ${dimension} does not match the backlog`,
      );
    }
  }
}

function buildDocsRemediationItem(risk, page) {
  const contentSignals = page.negativeSignals.filter((signal) =>
    ['task-friction', 'satisfaction'].includes(signal),
  );
  const confidence =
    contentSignals.includes('task-friction') &&
    contentSignals.includes('satisfaction')
      ? 'medium'
      : 'low';
  return {
    acceptanceCriteria: [
      `按页面目标完成一次端到端走查，并记录首个可复现阻塞步骤和 ${page.sourceFile} 中对应的章节锚点。`,
      '确认内容缺陷时，只修改被证据支持的段落；未确认时记录验证结果并关闭猜测性修改。',
      `修改后 ${page.pathname} 返回 200，且走查者能够完成目标：${page.goal}`,
    ],
    confidence,
    diagnosis:
      confidence === 'medium'
        ? '任务摩擦与满意度信号互相印证，但行为数据仍不能定位到具体缺陷段落。'
        : '行为信号提示页面可能阻碍任务，但现有证据不足以区分内容缺陷与技术体验问题。',
    evidence: {
      sessions: page.sessions,
      signals: page.signalEvidence.filter((item) =>
        contentSignals.includes(item.signal),
      ),
      window: 'current-28d',
    },
    id: `remediation:docs:${page.pathname}`,
    owner: 'docs',
    priority: risk.severity === 'high' ? 'P1' : 'P2',
    proposedChange: docsChangeProposal(page),
    riskId: risk.id,
    route: page.pathname,
    sourceFile: page.sourceFile,
    status: 'needs-validation',
    userImpact: `用户可能无法顺利完成文档任务：${page.goal}`,
    verification: [
      'bun run types:check',
      `在生产页面 ${page.pathname} 从头完成任务走查并记录结果。`,
    ],
  };
}

function docsChangeProposal(page) {
  const proposals = {
    'concept-explanation':
      '确认理解断点后，修改首个依赖隐含背景知识的段落：补充术语定义、适用边界和一个与页面目标直接相关的例子。',
    'faq-troubleshooting':
      '确认排障断点后，修改首个无法继续判断的步骤：补充症状、判定条件、操作和预期结果。',
    'navigation-landing':
      '确认选择歧义后，修改首屏入口标题和说明，使每个选项明确产品、平台、适用场景和下一步结果。',
    'release-download':
      '确认查找断点后，修改版本或平台入口，使发布变化、升级影响和下载目标能够从同一路径定位。',
    'sdk-api-reference':
      '确认检索断点后，修改 API 入口或操作说明，补齐权威操作、必要参数、成功响应和相关指南链接。',
    'task-guide':
      '确认首个失败步骤后，修改该步骤附近的前置条件、命令、工具链映射或成功判据，使读者无需外部猜测即可继续。',
  };
  return (
    proposals[page.pageType] ??
    '确认首个可复现阻塞点后，只修改对应段落并补齐继续任务所需的信息。'
  );
}

function buildPerformanceRemediationItem(risk, page, remediationTargets) {
  const performanceEvidence = page.signalEvidence.filter(
    (item) => item.signal === 'technical-experience',
  );
  return {
    acceptanceCriteria: [
      '定位到具体的渲染、资源加载或交互瓶颈，并记录负责人。',
      '生产环境 LCP p75 <= 2,500 ms、FCP p75 <= 3,000 ms、INP p75 <= 500 ms，或创建带负责人和复测日期的前端问题。',
    ],
    confidence: 'high',
    diagnosis:
      '至少一个页面性能指标超过既定阈值；这属于前端体验问题，不能作为内容重写依据。',
    evidence: {
      sessions: page.sessions,
      signals: performanceEvidence,
      window: 'current-28d',
    },
    id: `remediation:frontend:${page.pathname}`,
    owner: 'frontend',
    priority: risk.severity === 'high' ? 'P1' : 'P2',
    proposedChange:
      '对该路由做性能剖析，修复已确认的路由渲染、MDX 组件或资源加载瓶颈；不要用删减文档内容代替性能修复。',
    riskId: risk.id,
    route: page.pathname,
    sourceFile: remediationTargets.performance,
    status: 'external-owner',
    userImpact:
      '主要内容或交互加载过慢，用户可能在看到关键步骤前离开或重复点击。',
    verification: [
      `在生产页面 ${page.pathname} 复测 Web Vitals。`,
      '在下一完整报告窗口核对 LCP、FCP 和 INP p75。',
    ],
  };
}

function buildRouteRemediationItem(risk, remediationTargets) {
  const status = Number(risk.evidence?.status ?? 0);
  const isMissing = status === 404;
  return {
    acceptanceCriteria: isMissing
      ? [
          '人工确认替代页在产品、任务和平台语义上匹配旧路径。',
          '旧路径跳转到已确认替代页，跟随跳转后最终返回 200。',
          '没有可信替代页时记录 owner 和阻塞原因，不添加猜测性重定向。',
        ]
      : [
          '定位非 200 响应的路由或部署原因并分配负责人。',
          '生产路径恢复稳定的最终 HTTP 200。',
        ],
    confidence: 'high',
    diagnosis: isMissing
      ? '生产路径稳定返回 404，但替代目标尚未经过语义验证。'
      : `生产路径返回 HTTP ${status || 'unknown'}，需要路由或部署侧处理。`,
    evidence: {
      httpStatus: status,
      sessions: risk.evidence?.sessions ?? 0,
      window: 'current-28d',
    },
    id: `remediation:${isMissing ? 'docs' : 'frontend'}:${risk.pathname}`,
    owner: isMissing ? 'docs' : 'frontend',
    priority:
      isMissing && Number(risk.evidence?.sessions ?? 0) >= 100 ? 'P0' : 'P1',
    proposedChange: isMissing
      ? '查找并人工确认语义匹配的替代页；确认后在重定向源文件中增加可追溯映射并重新生成产物。'
      : '检查路由处理和部署结果，修复导致最终响应非 200 的已确认原因。',
    riskId: risk.id,
    route: risk.pathname,
    sourceFile: isMissing
      ? remediationTargets.redirects
      : remediationTargets.routeHandler,
    status: isMissing ? 'needs-validation' : 'external-owner',
    userImpact: isMissing
      ? '从旧链接或搜索结果进入的用户无法到达目标英文文档。'
      : '用户无法稳定打开该英文文档路径。',
    verification: isMissing
      ? [
          'bun run legacy-redirects:check',
          'bunx vitest run src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts src/routes/-docs-routing-guards.test.ts',
          `跟随 ${risk.pathname} 的生产跳转并确认最终状态为 200。`,
        ]
      : [`请求生产路径 ${risk.pathname} 并确认最终状态为 200。`],
  };
}

function buildDataRemediationItem(risk, dataHealth, remediationTargets) {
  return {
    acceptanceCriteria: [
      'PostHog 最新事件时间回到配置的新鲜度阈值内。',
      '数据恢复前不授权内容修改；恢复后重新生成报告。',
    ],
    confidence: 'high',
    diagnosis: '生产文档数据已过期，当前窗口不能支持内容决策。',
    evidence: {
      ageHours: risk.evidence?.ageHours ?? dataHealth.ageHours,
      status: dataHealth.status,
    },
    id: 'remediation:analytics:posthog-freshness',
    owner: 'analytics',
    priority: 'P0',
    proposedChange:
      '检查生产事件投递和 PostHog 查询链路，恢复新鲜数据后重新运行审计。',
    riskId: risk.id,
    route: '/en/',
    sourceFile: remediationTargets.analytics,
    status: 'external-owner',
    userImpact: '文档团队可能依据过期数据修改错误的页面。',
    verification: ['重新运行周报并确认 dataHealth.status 为 healthy。'],
  };
}

function buildInstrumentationRemediationItem(
  risk,
  instrumentation,
  remediationTargets,
) {
  return {
    acceptanceCriteria: [
      '关键结构化文档事件在生产环境均有可验证投递。',
      '下一报告窗口 instrumentation.status 为 healthy。',
    ],
    confidence: 'high',
    diagnosis: `结构化事件状态为 ${instrumentation.status}，任务代理证据不完整。`,
    evidence: {
      currentEvents:
        risk.evidence?.currentEvents ?? instrumentation.currentTotal,
      previousEvents:
        risk.evidence?.previousEvents ?? instrumentation.previousTotal,
      window: 'current-7d',
    },
    id: 'remediation:analytics:structured-events',
    owner: 'analytics',
    priority: 'P1',
    proposedChange:
      '核对事件定义、生产部署和 PostHog 接收情况，修复缺失或明显下降的结构化文档事件。',
    riskId: risk.id,
    route: '/en/',
    sourceFile: remediationTargets.analytics,
    status: 'external-owner',
    userImpact: '文档团队无法可靠判断查找、任务推进和反馈行为。',
    verification: [
      'bunx vitest run src/lib/analytics/posthog.test.ts',
      '重新运行周报并确认 instrumentation.status 为 healthy。',
    ],
  };
}

function compareRemediationItems(left, right) {
  const priorities = { P0: 0, P1: 1, P2: 2, P3: 3 };
  return (
    (priorities[left.priority] ?? 9) - (priorities[right.priority] ?? 9) ||
    left.owner.localeCompare(right.owner) ||
    left.route.localeCompare(right.route)
  );
}

export function buildMarkdownReport(report) {
  return report.reportType === 'monthly'
    ? buildMonthlyMarkdown(report)
    : buildWeeklyMarkdown(report);
}

async function main() {
  const { asOf, reportType } = parseArguments(process.argv.slice(2));
  const generatedAt = new Date().toISOString();
  const env = parseEnv(await readEnvFile(resolve(repoRoot, '.env.local')));
  const token = env.POSTHOG_PERSONAL_API_KEY;
  if (!token) {
    throw new Error('POSTHOG_PERSONAL_API_KEY is missing from .env.local');
  }

  const config = JSON.parse(
    await readFile(resolve(scriptDir, 'page-goals.json'), 'utf8'),
  );
  validateConfig(config);
  const remediationTargets = {
    ...DEFAULT_REMEDIATION_TARGETS,
    ...config.remediationTargets,
  };
  await assertRepositoryFilesExist(repoRoot, Object.values(remediationTargets));
  const sourceIndex = buildDocSourceIndex(await listDocSourceFiles(repoRoot));
  const pageConfig = attachPageSources(config.pages, sourceIndex);
  await assertRepositoryFilesExist(
    repoRoot,
    pageConfig.map((page) => page.sourceFile),
  );
  const eventHealthDays =
    config.monitoring?.eventHealthDays ?? DEFAULT_EVENT_HEALTH_DAYS;
  const windows = buildWindows(asOf, eventHealthDays);
  const pathList = pageConfig.map((page) => page.pathname);
  const quotedPaths = pathList.map(quoteSqlString).join(', ');

  const [
    rangeRows,
    currentTotalRows,
    currentMetricRows,
    currentVitalsRows,
    topRows,
    currentCoverageRows,
    previousCoverageRows,
    currentJourneyRows,
    currentJourneyStepRows,
    previousTotalRows,
    previousMetricRows,
    previousVitalsRows,
    previousJourneyRows,
    previousJourneyStepRows,
  ] = await Promise.all([
    queryPostHog(token, dataRangeQuery(asOf)),
    queryPostHog(token, totalsQuery(windows.current)),
    queryPostHog(token, pageMetricsQuery(quotedPaths, windows.current)),
    queryPostHog(token, vitalsQuery(quotedPaths, windows.current)),
    queryPostHog(token, topRoutesQuery(windows.current)),
    queryPostHog(token, eventCoverageQuery(windows.eventHealth)),
    queryPostHog(token, eventCoverageQuery(windows.previousEventHealth)),
    queryPostHog(token, journeyPathsQuery(windows.current)),
    queryPostHog(token, journeyStepCoverageQuery(windows.eventHealth)),
    reportType === 'monthly'
      ? queryPostHog(token, totalsQuery(windows.previous))
      : Promise.resolve([]),
    reportType === 'monthly'
      ? queryPostHog(token, pageMetricsQuery(quotedPaths, windows.previous))
      : Promise.resolve([]),
    reportType === 'monthly'
      ? queryPostHog(token, vitalsQuery(quotedPaths, windows.previous))
      : Promise.resolve([]),
    reportType === 'monthly'
      ? queryPostHog(token, journeyPathsQuery(windows.previous))
      : Promise.resolve([]),
    reportType === 'monthly'
      ? queryPostHog(
          token,
          journeyStepCoverageQuery(windows.previousEventHealth),
        )
      : Promise.resolve([]),
  ]);

  const pages = buildClassifiedPages(
    pageConfig,
    currentMetricRows,
    currentVitalsRows,
  );
  const previousPages =
    reportType === 'monthly'
      ? buildClassifiedPages(pageConfig, previousMetricRows, previousVitalsRows)
      : [];
  const currentTotals = normalizeTotals(currentTotalRows[0]);
  const previousTotals = normalizeTotals(previousTotalRows[0]);
  const currentCoverage = normalizeEventCoverage(currentCoverageRows);
  const previousCoverage = normalizeEventCoverage(previousCoverageRows);
  const journeyInsights = buildJourneyInsights({
    pathRows: currentJourneyRows,
    stepRows: currentJourneyStepRows,
  });
  const previousJourneyInsights =
    reportType === 'monthly'
      ? buildJourneyInsights({
          pathRows: previousJourneyRows,
          stepRows: previousJourneyStepRows,
        })
      : null;
  const dataHealth = evaluateDataHealth(
    rangeRows[0],
    asOf,
    config.monitoring?.dataFreshnessHours ?? 48,
  );
  const instrumentation = evaluateInstrumentation({
    asOf,
    config: config.instrumentation,
    currentEvents: currentCoverage,
    currentSessions: currentTotals.sessions,
    previousEvents: previousCoverage,
  });
  const earliestEventMs = dataHealth.earliestEvent
    ? new Date(dataHealth.earliestEvent).getTime()
    : Number.POSITIVE_INFINITY;
  const previousWindowComplete =
    earliestEventMs <= new Date(windows.previous.start).getTime();
  const routeHealth = await verifyRoutes(
    topRows.slice(0, config.monitoring?.topRouteChecks ?? 40),
  );
  const routeRisks = routeHealth.filter((route) => route.status !== 200);
  const configuredPaths = new Set(pathList);
  const portfolioGaps = topRows
    .slice(0, config.monitoring?.topRoutePortfolioSize ?? 20)
    .filter((route) => !configuredPaths.has(route.pathname))
    .map(normalizeRouteRow);
  const reportsDir = defaultReportsDir;
  const previousWeekly = await readJsonIfExists(
    resolve(reportsDir, 'latest-weekly.json'),
  );
  const usablePreviousWeekly =
    previousWeekly &&
    new Date(previousWeekly.asOf).getTime() < new Date(asOf).getTime()
      ? previousWeekly
      : null;
  const currentRisks = deriveRisks({
    dataHealth,
    instrumentation,
    pages,
    routeRisks,
  });
  const risks = buildRiskLifecycle(currentRisks, usablePreviousWeekly, asOf);
  const remediationBacklog = buildRemediationBacklog({
    dataHealth,
    instrumentation,
    pages,
    remediationTargets,
    risks,
  });
  const comparison = buildComparison({
    available: reportType === 'monthly' && previousWindowComplete,
    currentPages: pages,
    currentJourneys: journeyInsights,
    currentTotals,
    previousJourneys: previousJourneyInsights,
    previousPages,
    previousTotals,
  });
  const agentBenchmarks =
    reportType === 'monthly'
      ? await loadLatestValidBenchmarks(config.agentBenchmark, repoRoot)
      : [];
  const cognitiveHypotheses =
    reportType === 'monthly' ? buildCognitiveHypotheses(pages) : [];
  const decisions =
    reportType === 'monthly'
      ? buildMonthlyDecisions({
          comparison,
          dataHealth,
          instrumentation,
          pages,
          previousPages,
          risks,
          routeRisks,
        })
      : [];

  const report = {
    agentBenchmarks,
    asOf,
    benchmarkPortfolio: config.benchmarkTasks,
    cognitiveHypotheses,
    comparison,
    dashboardUrl:
      env.POSTHOG_DOCS_QUALITY_DASHBOARD_URL ?? config.dashboardUrl ?? null,
    dataHealth,
    dataRange: {
      current: windows.current,
      eventHealth: windows.eventHealth,
      previous: reportType === 'monthly' ? windows.previous : null,
      previousEventHealth: windows.previousEventHealth,
      previousWindowComplete,
    },
    decisions,
    eventCoverage: {
      current: currentCoverage,
      previous: previousCoverage,
    },
    filters: {
      browser: 'non-null, excluding Headless Chrome',
      host: PRODUCTION_HOST,
      locale: 'en',
    },
    generatedAt,
    instrumentation,
    journeyInsights,
    pages,
    policyVersion: config.policyVersion ?? DEFAULT_POLICY_VERSION,
    portfolioGaps,
    previousJourneyInsights,
    previousPages: reportType === 'monthly' ? previousPages : [],
    remediationBacklog,
    remediationSummary: summarizeRemediationBacklog(remediationBacklog),
    reportType,
    risks,
    routeRisks,
    runId: `${reportType}-${generatedAt}`,
    schemaVersion: SCHEMA_VERSION,
    totals: {
      current: currentTotals,
      previous: reportType === 'monthly' ? previousTotals : null,
    },
  };

  assertRemediationBacklog(report);
  const markdown = buildMarkdownReport(report);
  const json = `${JSON.stringify(report, null, 2)}\n`;
  assertReportPrivacy(markdown);
  assertReportPrivacy(json);
  const paths = await writeReportFiles({
    asOf,
    generatedAt,
    json,
    markdown,
    reportType,
    reportsDir,
  });
  process.stdout.write(`Report type: ${reportType}\n`);
  process.stdout.write(`Markdown report: ${paths.markdownPath}\n`);
  process.stdout.write(`JSON report: ${paths.jsonPath}\n`);
}

function parseArguments(arguments_) {
  let reportType = 'weekly';
  let asOf = new Date().toISOString();
  for (const argument of arguments_) {
    if (argument === 'weekly' || argument === 'monthly') {
      reportType = argument;
    } else if (argument.startsWith('--mode=')) {
      reportType = argument.slice('--mode='.length);
    } else if (argument.startsWith('--as-of=')) {
      asOf = argument.slice('--as-of='.length);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  if (!['weekly', 'monthly'].includes(reportType)) {
    throw new Error(`Unsupported report type: ${reportType}`);
  }
  return { asOf: requireIsoTimestamp(asOf), reportType };
}

function validateConfig(config) {
  if (!Array.isArray(config.pages) || config.pages.length === 0) {
    throw new Error('pages are missing from page-goals.json');
  }
  if (!config.agentBenchmark) {
    throw new Error('agentBenchmark is missing from page-goals.json');
  }
}

function buildClassifiedPages(pageConfig, metricRows, vitalRows) {
  const metricsByPath = new Map(
    metricRows.map((row) => [row.pathname, normalizePageMetrics(row)]),
  );
  const vitalsByPath = new Map(
    vitalRows.map((row) => [row.pathname, normalizeVitals(row)]),
  );
  const pageMetrics = pageConfig.map((page) => ({
    ...page,
    ...emptyMetrics(),
    ...metricsByPath.get(page.pathname),
    ...vitalsByPath.get(page.pathname),
  }));
  const baselinesByType = buildBaselines(pageMetrics);
  return pageMetrics.map((page) => ({
    ...page,
    ...classifyPage(page, baselinesByType.get(page.pageType)),
  }));
}

function buildBaselines(pages) {
  const groups = new Map();
  for (const page of pages) {
    const group = groups.get(page.pageType) ?? [];
    group.push(page);
    groups.set(page.pageType, group);
  }

  return new Map(
    Array.from(groups, ([pageType, group]) => [
      pageType,
      {
        helpfulRateP20: percentile(
          group
            .filter(
              (page) => page.feedbackVotes >= 10 && page.helpfulRate !== null,
            )
            .map((page) => page.helpfulRate),
          0.2,
        ),
        rageSessionRateP80: percentile(
          group
            .filter((page) => page.sessions >= 30)
            .map((page) => page.rageSessionRate),
          0.8,
        ),
      },
    ]),
  );
}

function emptyMetrics() {
  return {
    fcpP75: null,
    feedbackVotes: 0,
    helpfulRate: null,
    helpfulVotes: 0,
    inpP75: null,
    lcpP75: null,
    pageviews: 0,
    rageSessionRate: 0,
    rageSessions: 0,
    sessions: 0,
  };
}

function normalizePageMetrics(row) {
  const sessions = Number(row.sessions ?? 0);
  const feedbackVotes = Number(row.feedback_votes ?? 0);
  const helpfulVotes = Number(row.helpful_votes ?? 0);
  const rageSessions = Number(row.rage_sessions ?? 0);
  return {
    feedbackVotes,
    helpfulRate: feedbackVotes > 0 ? helpfulVotes / feedbackVotes : null,
    helpfulVotes,
    pageviews: Number(row.pageviews ?? 0),
    rageSessionRate: sessions > 0 ? rageSessions / sessions : 0,
    rageSessions,
    sessions,
  };
}

function normalizeVitals(row) {
  return {
    fcpP75: nullableNumber(row.fcp_p75, row.fcp_events),
    inpP75: nullableNumber(row.inp_p75, row.inp_events),
    lcpP75: nullableNumber(row.lcp_p75, row.lcp_events),
  };
}

function nullableNumber(value, count) {
  return Number(count ?? 0) > 0 ? Number(value) : null;
}

function normalizeTotals(row) {
  return {
    pageviews: Number(row?.pageviews ?? 0),
    sessions: Number(row?.sessions ?? 0),
  };
}

function normalizeEventCoverage(rows) {
  return STRUCTURED_EVENTS.map((event) => ({
    count: Number(rows.find((row) => row.event === event)?.events ?? 0),
    event,
  }));
}

export function buildJourneyInsights({ pathRows, stepRows }) {
  const stepCoverage = normalizeJourneyStepCoverage(stepRows);
  const topPaths = pathRows
    .map(normalizeJourneyPathRow)
    .filter((path) => path.transitions.length > 0)
    .sort(
      (left, right) =>
        right.sessions - left.sessions ||
        right.pageviews - left.pageviews ||
        left.pathKey.localeCompare(right.pathKey),
    );

  return {
    stepCoverage,
    topPaths,
  };
}

function normalizeJourneyStepCoverage(rows) {
  const first = rows[0] ?? {};
  return {
    eventCount: Number(first.event_count ?? 0),
    previousPageTransitions: Number(first.previous_page_transitions ?? 0),
    source: 'posthog-session-pageview-flow',
    uniqueSessions: Number(first.unique_sessions ?? 0),
  };
}

function normalizeJourneyPathRow(row) {
  const path = String(row.path ?? '')
    .split(' > ')
    .map((item) => item.trim())
    .filter((item) => item.startsWith('/en/'));
  return {
    entryPathname: path[0] ?? null,
    exitPathname: path.at(-1) ?? null,
    pageviews: Number(row.pageviews ?? 0),
    pathKey: path.join(' > '),
    sessions: Number(row.sessions ?? 0),
    transitions: path.slice(0, 5),
  };
}

function normalizeRouteRow(row) {
  return {
    pageviews: Number(row.pageviews ?? 0),
    pathname: row.pathname,
    sessions: Number(row.sessions ?? 0),
  };
}

function deriveRisks({ dataHealth, instrumentation, pages, routeRisks }) {
  const risks = [];
  if (dataHealth.status !== 'healthy') {
    risks.push({
      evidence: { ageHours: dataHealth.ageHours },
      id: 'data:posthog-freshness',
      kind: 'data-health',
      recommendation:
        'Restore fresh PostHog data before making content decisions.',
      severity: 'high',
    });
  }
  if (
    ['instrumentation-failure', 'instrumentation-degraded'].includes(
      instrumentation.status,
    )
  ) {
    risks.push({
      evidence: {
        currentEvents: instrumentation.currentTotal,
        previousEvents: instrumentation.previousTotal,
      },
      id: 'instrumentation:structured-events',
      kind: 'instrumentation',
      recommendation: 'Verify structured documentation event delivery.',
      severity: 'high',
    });
  }
  for (const page of pages.filter(
    (page) => page.status === 'needs-improvement',
  )) {
    risks.push({
      evidence: {
        negativeSignals: page.negativeSignals,
        sessions: page.sessions,
      },
      id: `page:${page.pathname}`,
      kind: 'page-quality',
      pathname: page.pathname,
      recommendation:
        'Validate the corroborating signals before changing content.',
      severity: 'high',
    });
  }
  for (const route of routeRisks) {
    risks.push({
      evidence: { sessions: route.sessions, status: route.status },
      id: `route:${route.pathname}`,
      kind: 'route-health',
      pathname: route.pathname,
      recommendation: 'Verify the replacement page before adding a redirect.',
      severity: route.sessions >= 100 ? 'high' : 'medium',
    });
  }
  return risks;
}

function compareJourneyPaths(currentPaths, previousPaths) {
  const previousByKey = new Map(
    previousPaths.map((path) => [path.pathKey, path.sessions]),
  );

  return currentPaths.slice(0, 10).map((path) => ({
    pathKey: path.pathKey,
    sessions: metricDelta(path.sessions, previousByKey.get(path.pathKey) ?? 0),
  }));
}

function buildCognitiveHypotheses(pages) {
  return pages
    .filter(
      (page) =>
        page.cognitiveCategory &&
        page.negativeSignals.includes('task-friction') &&
        page.negativeSignals.includes('satisfaction'),
    )
    .map((page) => ({
      category: page.cognitiveCategory,
      evidence: ['task-friction', 'satisfaction'],
      goal: page.goal,
      pathname: page.pathname,
      status: 'hypothesis',
      validation:
        'Validate with categorized feedback, usability research, or another qualitative source.',
    }));
}

function buildMonthlyDecisions({
  comparison,
  dataHealth,
  instrumentation,
  pages,
  previousPages,
  risks,
  routeRisks,
}) {
  if (!dataHealth.decisionAuthorized) {
    return [
      {
        decision: 'instrument',
        reason:
          'PostHog data is stale, so content decisions are not authorized.',
        target: 'posthog-data',
      },
    ];
  }

  const decisions = [];
  if (
    ['instrumentation-failure', 'instrumentation-degraded'].includes(
      instrumentation.status,
    )
  ) {
    decisions.push({
      decision: 'instrument',
      reason: `Structured event status is ${instrumentation.status}.`,
      target: 'structured-events',
    });
  }
  const previousByPath = new Map(
    previousPages.map((page) => [page.pathname, page]),
  );
  for (const page of pages.filter(
    (item) => item.status === 'needs-improvement',
  )) {
    const previous = previousByPath.get(page.pathname);
    const risk = risks.find((item) => item.id === `page:${page.pathname}`);
    const persistent =
      (comparison.available && previous?.status === 'needs-improvement') ||
      (risk?.occurrences ?? 0) >= 2;
    decisions.push({
      decision: persistent ? 'act' : 'validate',
      reason: persistent
        ? 'At least two negative signals persisted across observations.'
        : 'The page has corroborating signals, but persistence is not established.',
      target: page.pathname,
    });
  }
  for (const route of routeRisks) {
    decisions.push({
      decision: 'validate',
      reason: `The route returned ${route.status}; confirm its valid replacement before redirecting.`,
      target: route.pathname,
    });
  }
  if (decisions.length === 0) {
    decisions.push({
      decision: 'watch',
      reason: 'No evidence currently crosses an action threshold.',
      target: 'portfolio',
    });
  }
  return decisions;
}

export async function loadLatestValidBenchmarks(config, root) {
  const artifactsPath = resolveInsideRoot(
    root,
    config.artifactsPath ??
      '.agent/docs-benchmark-pilot/.artifacts/docs-benchmark',
  );
  const batches = [];
  try {
    const entries = await readdir(artifactsPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }
      const batchDir = resolve(artifactsPath, entry.name);
      const batch = await readValidBenchmarkBatch(batchDir);
      if (batch) {
        batches.push(batch);
      }
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }
  }

  const selected = selectLatestBenchmarks(batches);
  if (selected.length > 0) {
    return selected;
  }

  const fallback = (config.fallback ?? [])
    .map((summary) =>
      normalizeAgentBenchmarkSummary(
        summary,
        { validResults: summary.overall?.total ?? 0 },
        'configured-fallback',
      ),
    )
    .filter(Boolean);
  if (fallback.length === 0) {
    throw new Error(
      'No valid completed Agent benchmark batch is available for the monthly report.',
    );
  }
  return selectLatestBenchmarks(fallback);
}

async function readValidBenchmarkBatch(batchDir) {
  const summary = await readJsonIfExists(resolve(batchDir, 'summary.json'));
  const batchErrors = await readJsonIfExists(
    resolve(batchDir, 'batch-errors.json'),
  );
  if (!summary || !Array.isArray(batchErrors) || batchErrors.length > 0) {
    return null;
  }

  const entries = await readdir(batchDir, { withFileTypes: true });
  let validResults = 0;
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'attempts') {
      continue;
    }
    const runDir = resolve(batchDir, entry.name);
    if (
      (await fileExists(resolve(runDir, 'executor-result.json'))) &&
      (await fileExists(resolve(runDir, 'judge-result.json'))) &&
      (await fileExists(resolve(runDir, 'result.json')))
    ) {
      validResults += 1;
    }
  }
  return normalizeAgentBenchmarkSummary(
    summary,
    { validResults },
    'benchmark-artifact',
  );
}

function buildWeeklyMarkdown(report) {
  const statusCounts = countBy(report.pages, (page) => page.status);
  const lifecycleCounts = countBy(report.risks, (risk) => risk.lifecycle);
  const activeRisks = report.risks.filter(
    (risk) => risk.lifecycle !== 'resolved',
  );
  const backlog = report.remediationBacklog ?? [];
  const docsItems = backlog.filter((item) => item.owner === 'docs');
  const externalItems = backlog.filter((item) => item.owner !== 'docs');
  const dashboardText = report.dashboardUrl
    ? `[打开 PostHog Dashboard](${report.dashboardUrl})`
    : 'Dashboard URL 尚未配置。';

  return `# English Docs Weekly Issue-ready Remediation Backlog

生成时间：${report.generatedAt}  
数据截止：${report.asOf}  
${dashboardText}

## 本周执行清单

按优先级执行。needs-validation 先完成诊断，external-owner 转交对应团队；达到验收标准后再关闭。

${buildBacklogOverview(backlog)}

## 文档修复任务

${buildRemediationDetails(docsItems)}

## 非文档问题分流

${buildRemediationDetails(externalItems)}

## 本周不要做

- 不批量修改 ${statusCounts.watch ?? 0} 个观察页面；它们目前只有单一信号，先保留观察。
- 不根据本周事件直接判断用户完成了产品接入；搜索、复制代码、平台选择和链接点击只是任务代理。
- 不根据单周波动重写页面；先完成 needs-validation 条目的人工验证。

## 状态摘要

- 数据新鲜度：${weeklyDataHealthLabel(report.dataHealth.status)}；埋点状态：${weeklyInstrumentationLabel(report.instrumentation.status)}。
- 活动风险 ${activeRisks.length} 项：首次发现 ${lifecycleCounts.new ?? 0}，持续出现 ${lifecycleCounts.ongoing ?? 0}；本周已解决 ${lifecycleCounts.resolved ?? 0}。
- 当前滚动 28 天包含 ${formatInteger(report.totals.current.sessions)} 个英文真人会话和 ${formatInteger(report.totals.current.pageviews)} 次页面浏览。
- 页面组合：需处理 ${statusCounts['needs-improvement'] ?? 0}，观察 ${statusCounts.watch ?? 0}，正常 ${statusCounts.healthy ?? 0}，证据不足 ${statusCounts['insufficient-evidence'] ?? 0}。
- 最近 ${report.dataRange.eventHealth.windowDays} 天记录 ${formatInteger(report.instrumentation.currentTotal)} 个结构化文档事件；前一相同窗口为 ${formatInteger(report.instrumentation.previousTotal)}。

## 用户旅程路径

${buildJourneySection(report.journeyInsights)}

## 运行边界

- 页面质量使用滚动 28 天窗口；事件投递健康使用最近 ${report.dataRange.eventHealth.windowDays} 天。
- 少于 30 sessions 为 insufficient；30-99 为 directional；100 及以上才完整分类。
- 至少 10 个反馈投票才形成满意度证据；至少两个负面信号才标记 needs-improvement。
- Agent Benchmark 不在周监控中刷新或参与决策。
- 周报不推断用户心智，也不把任务代理当作产品接入完成。
- 用户旅程路径来自匿名聚合会话页面流，只用于发现英文文档入口和下一步路径，不保留原始用户级路径。
`;
}

function weeklyDataHealthLabel(status) {
  const labels = {
    healthy: '正常',
    stale: '数据过期，暂停决策',
  };
  return labels[status] ?? status;
}

function weeklyInstrumentationLabel(status) {
  const labels = {
    healthy: '正常',
    'instrumentation-degraded': '部分事件下降，需要数据侧排查',
    'instrumentation-failure': '没有收到事件，需要数据侧排查',
    'not-deployed': '尚未确认上线',
    'warming-up': '刚上线观察期',
  };
  return labels[status] ?? status;
}

function buildBacklogOverview(backlog) {
  if (backlog.length === 0) {
    return '当前没有需要执行或分流的 remediation item。';
  }
  const rows = backlog
    .map(
      (item) =>
        `| ${item.priority} | ${item.status} | ${item.owner} | \`${item.route}\` | \`${item.sourceFile}\` |`,
    )
    .join('\n');
  return `| Priority | Status | Owner | Route | Source file |
| --- | --- | --- | --- | --- |
${rows}`;
}

function buildRemediationDetails(items) {
  if (items.length === 0) {
    return '当前没有此类任务。';
  }
  return items.map(buildRemediationDetail).join('\n\n');
}

function buildRemediationDetail(item) {
  const acceptance = item.acceptanceCriteria
    .map((criterion) => `  - ${criterion}`)
    .join('\n');
  const verification = item.verification
    .map((method) => `  - ${formatVerificationMethod(method)}`)
    .join('\n');
  return `### \`${item.id}\`

- 优先级：${item.priority}
- 状态：${item.status}
- Owner：${item.owner}
- Route：\`${item.route}\`
- Source：\`${item.sourceFile}\`
- 用户影响：${item.userImpact}
- 证据：${formatRemediationEvidence(item.evidence)}
- 诊断置信度：${item.confidence}
- 诊断：${item.diagnosis}
- 具体修改建议：${item.proposedChange}
- 验收标准：
${acceptance}
- 验证方法：
${verification}`;
}

function formatRemediationEvidence(evidence) {
  const parts = [];
  if (evidence.window) {
    parts.push(`窗口 ${evidence.window}`);
  }
  if (evidence.sessions !== undefined) {
    parts.push(`${formatInteger(evidence.sessions)} sessions`);
  }
  if (evidence.httpStatus !== undefined) {
    parts.push(`HTTP ${evidence.httpStatus || 'unknown'}`);
  }
  if (evidence.ageHours !== undefined) {
    parts.push(`数据延迟 ${evidence.ageHours} 小时`);
  }
  if (evidence.currentEvents !== undefined) {
    parts.push(`当前 ${formatInteger(evidence.currentEvents)} events`);
  }
  if (evidence.previousEvents !== undefined) {
    parts.push(`前一窗口 ${formatInteger(evidence.previousEvents)} events`);
  }
  if (evidence.status) {
    parts.push(`状态 ${evidence.status}`);
  }
  for (const signal of evidence.signals ?? []) {
    parts.push(formatSignalEvidence(signal));
  }
  return parts.join('；') || '已记录结构化证据';
}

function formatSignalEvidence(signal) {
  if (typeof signal === 'string') {
    return signal;
  }
  const percentMetrics = new Set(['helpfulRate', 'rageSessionRate']);
  const value = percentMetrics.has(signal.metric)
    ? formatPercent(signal.value)
    : `${formatInteger(signal.value)} ms`;
  const threshold = percentMetrics.has(signal.metric)
    ? formatPercent(signal.threshold)
    : `${formatInteger(signal.threshold)} ms`;
  const comparison = signal.comparison === 'below' ? '低于' : '高于';
  return `${signal.metric} ${value}，${comparison}阈值 ${threshold}`;
}

function formatVerificationMethod(method) {
  return /^(?:bun|bunx|node|bash|curl)\b/.test(method)
    ? `\`${method}\``
    : method;
}

function buildMonthlyMarkdown(report) {
  const statusCounts = countBy(report.pages, (page) => page.status);
  const backlog = report.remediationBacklog ?? [];
  const docsItems = backlog.filter((item) => item.owner === 'docs');
  const externalItems = backlog.filter((item) => item.owner !== 'docs');
  const dashboardText = report.dashboardUrl
    ? `[打开 PostHog Dashboard](${report.dashboardUrl})`
    : 'Dashboard URL 尚未配置。';
  const decisionRows = report.decisions
    .map((item) => `| ${item.decision} | \`${item.target}\` | ${item.reason} |`)
    .join('\n');
  const comparisonText = report.comparison.available
    ? `前一窗口 ${formatInteger(report.totals.previous.sessions)} sessions；当前变化 ${formatSignedPercent(report.comparison.totals.sessions.changeRate)}。`
    : '前一完整 28 天窗口不可用，本期不宣称环比变化。';
  const routeRows = report.routeRisks.length
    ? report.routeRisks
        .map(
          (route) =>
            `| \`${route.pathname}\` | ${route.sessions} | ${route.status} |`,
        )
        .join('\n')
    : '| - | 0 | 当前 Top 路径未发现不可访问项 |';
  const benchmarkRows = report.agentBenchmarks.length
    ? report.agentBenchmarks
        .flatMap((batch) =>
          Object.entries(batch.byVendor).map(
            ([vendor, result]) =>
              `| \`${batch.taskId}\` | ${vendor} | ${result.passed}/${result.total} | ${formatPercent(result.passRate)} |`,
          ),
        )
        .join('\n')
    : '| - | - | - | - |';
  const hypothesisRows = report.cognitiveHypotheses.length
    ? report.cognitiveHypotheses
        .map(
          (item) =>
            `| \`${item.pathname}\` | ${item.category} | ${item.evidence.join(' + ')} | ${item.validation} |`,
        )
        .join('\n')
    : '| - | - | - | 当前没有满足双行为证据要求的认知摩擦假设 |';

  return `# English Docs Monthly Decision and Remediation Report

生成时间：${report.generatedAt}  
数据截止：${report.asOf}  
${dashboardText}

## 本月修复队列

${buildBacklogOverview(backlog)}

## 文档修复任务

${buildRemediationDetails(docsItems)}

## 非文档问题分流

${buildRemediationDetails(externalItems)}

## 决策摘要

| Decision | Target | Evidence-based reason |
| --- | --- | --- |
${decisionRows}

## 质量基线

- 数据健康：${report.dataHealth.status}；${comparisonText}
- 当前窗口包含 ${formatInteger(report.totals.current.sessions)} 个英文真人会话和 ${formatInteger(report.totals.current.pageviews)} 次页面浏览。
- 页面组合：needs-improvement ${statusCounts['needs-improvement'] ?? 0}，watch ${statusCounts.watch ?? 0}，healthy ${statusCounts.healthy ?? 0}，insufficient-evidence ${statusCounts['insufficient-evidence'] ?? 0}。
- Top 流量中发现 ${report.routeRisks.length} 个不可访问或异常路由。
- 结构化事件状态：${report.instrumentation.status}；最近 ${report.dataRange.eventHealth.windowDays} 天 ${formatInteger(report.instrumentation.currentTotal)} 个事件。

## 高流量路由风险

| Path | Human sessions | HTTP status |
| --- | ---: | ---: |
${routeRows}

404 可能来自迁移或重定向不完整。确认有效替代页面后再判断原因。

## 用户旅程路径

${buildJourneySection(report.journeyInsights)}

## 认知摩擦假设

| Page | Category | Evidence | Required validation |
| --- | --- | --- | --- |
${hypothesisRows}

这些条目只是待验证假设，不是对用户心智的直接测量。

## Agent Benchmark

| Task | Vendor | Hard pass | Pass rate |
| --- | --- | ---: | ---: |
${benchmarkRows}

只包含具有完整 Executor、Judge 和最终结果的最新已完成批次。Agent 证据与真人行为证据分开，不生成全站总分或全站竞品排名。

## 证据边界

- 当前窗口和前一窗口均为非重叠 28 天；前一窗口不完整时不作趋势判断。
- 少于 30 sessions 为 insufficient；30-99 为 directional；100 及以上才完整分类。
- 至少 10 个反馈投票才形成满意度证据；至少两个负面信号才标记 needs-improvement。
- 搜索、复制代码和任务按钮点击只是任务代理，不能代表产品接入完成。
- 用户旅程路径只报告匿名聚合路径，不导出单个 session 或 person 级事件。
`;
}

function buildJourneySection(journeyInsights) {
  if (!journeyInsights?.topPaths?.length) {
    return '当前窗口没有足够的英文页面流生成稳定路径。';
  }

  const rows = journeyInsights.topPaths
    .slice(0, 10)
    .map(
      (path) =>
        `| ${path.transitions.map((item) => `\`${item}\``).join(' -> ')} | ${formatInteger(path.sessions)} | ${formatInteger(path.pageviews)} |`,
    )
    .join('\n');

  return `来源：${journeyInsights.stepCoverage.source}；覆盖 ${formatInteger(journeyInsights.stepCoverage.uniqueSessions)} 个匿名英文会话，${formatInteger(journeyInsights.stepCoverage.previousPageTransitions)} 次相邻页面跳转。

| Path | Sessions | Pageviews in path |
| --- | ---: | ---: |
${rows}`;
}

async function writeReportFiles({
  asOf,
  generatedAt,
  json,
  markdown,
  reportType,
  reportsDir,
}) {
  const period = reportPeriod(reportType, asOf);
  const outputDir = resolve(reportsDir, reportType, period);
  await mkdir(outputDir, { recursive: true });
  const timestamp = generatedAt.replaceAll(':', '-');
  const baseName = `${timestamp}-${reportType}-docs-quality`;
  const jsonPath = resolve(outputDir, `${baseName}.json`);
  const markdownPath = resolve(outputDir, `${baseName}.md`);
  await writeFile(jsonPath, json, { flag: 'wx' });
  await writeFile(markdownPath, markdown, { flag: 'wx' });
  await writeFile(resolve(reportsDir, `latest-${reportType}.json`), json);
  await writeFile(resolve(reportsDir, `latest-${reportType}.md`), markdown);
  return { jsonPath, markdownPath };
}

function dataRangeQuery(asOf) {
  return `SELECT min(timestamp) AS earliest_event, max(timestamp) AS latest_event
FROM events
WHERE event = '$pageview'
  AND timestamp < ${timestampExpression(asOf)}
  AND properties.$host = '${PRODUCTION_HOST}'
  AND properties.$pathname LIKE '/en/%'
  AND properties.$browser IS NOT NULL
  AND properties.$browser NOT IN ('Chrome Headless', 'Headless Chrome')`;
}

function totalsQuery(window) {
  return `SELECT count() AS pageviews, uniqExact(properties.$session_id) AS sessions
FROM events
WHERE event = '$pageview' AND ${humanEnglishFilter(window)}`;
}

function pageMetricsQuery(quotedPaths, window) {
  return `SELECT
  coalesce(properties.$pathname, properties.pathname) AS pathname,
  countIf(event = '$pageview') AS pageviews,
  uniqExactIf(properties.$session_id, event = '$pageview') AS sessions,
  uniqExactIf(properties.$session_id, event = '$rageclick') AS rage_sessions,
  countIf(event = 'docs_page_feedback') AS feedback_votes,
  countIf(event = 'docs_page_feedback' AND properties.value = 'yes') AS helpful_votes
FROM events
WHERE ${windowFilter(window)}
  AND properties.$host = '${PRODUCTION_HOST}'
  AND properties.$browser IS NOT NULL
  AND properties.$browser NOT IN ('Chrome Headless', 'Headless Chrome')
  AND event IN ('$pageview', '$rageclick', 'docs_page_feedback')
  AND coalesce(properties.$pathname, properties.pathname) IN (${quotedPaths})
GROUP BY pathname`;
}

function vitalsQuery(quotedPaths, window) {
  return `SELECT
  properties.$pathname AS pathname,
  countIf(properties.$web_vitals_LCP_value IS NOT NULL) AS lcp_events,
  quantileIf(0.75)(toFloat(properties.$web_vitals_LCP_value), properties.$web_vitals_LCP_value IS NOT NULL) AS lcp_p75,
  countIf(properties.$web_vitals_INP_value IS NOT NULL) AS inp_events,
  quantileIf(0.75)(toFloat(properties.$web_vitals_INP_value), properties.$web_vitals_INP_value IS NOT NULL) AS inp_p75,
  countIf(properties.$web_vitals_FCP_value IS NOT NULL) AS fcp_events,
  quantileIf(0.75)(toFloat(properties.$web_vitals_FCP_value), properties.$web_vitals_FCP_value IS NOT NULL) AS fcp_p75
FROM events
WHERE event = '$web_vitals' AND ${humanEnglishFilter(window)}
  AND properties.$pathname IN (${quotedPaths})
GROUP BY pathname`;
}

function topRoutesQuery(window) {
  return `SELECT properties.$pathname AS pathname, count() AS pageviews, uniqExact(properties.$session_id) AS sessions
FROM events
WHERE event = '$pageview' AND ${humanEnglishFilter(window)}
GROUP BY pathname
ORDER BY sessions DESC, pageviews DESC
LIMIT 80`;
}

function eventCoverageQuery(window) {
  return `SELECT event, count() AS events
FROM events
WHERE ${windowFilter(window)}
  AND properties.$host = '${PRODUCTION_HOST}'
  AND properties.docs_locale = 'en'
  AND event IN (${STRUCTURED_EVENTS.map(quoteSqlString).join(', ')})
GROUP BY event`;
}

export function journeyPathsQuery(window) {
  return `SELECT path, count() AS sessions, sum(path_length) AS pageviews
FROM (
  SELECT
    session_id,
    arrayStringConcat(
      arraySlice(arrayMap(item -> item.2, arraySort(groupArray(tuple(first_seen, pathname)))), 1, 5),
      ' > '
    ) AS path,
    count() AS path_length
  FROM (
    SELECT
      properties.$session_id AS session_id,
      properties.$pathname AS pathname,
      timestamp AS first_seen
    FROM events
    WHERE event = '$pageview' AND ${humanEnglishFilter(window)}
      AND properties.$session_id IS NOT NULL
      AND properties.$pathname IS NOT NULL
    LIMIT 40000
  )
  GROUP BY session_id
  HAVING path_length >= 2
)
GROUP BY path
ORDER BY sessions DESC, pageviews DESC
LIMIT 20`;
}

function journeyStepCoverageQuery(window) {
  return `SELECT
  uniqExact(properties.$session_id) AS unique_sessions,
  count() AS event_count,
  greatest(count() - uniqExact(properties.$session_id), 0) AS previous_page_transitions
FROM events
WHERE event = '$pageview' AND ${humanEnglishFilter(window)}
  AND properties.$session_id IS NOT NULL`;
}

function humanEnglishFilter(window) {
  return `${windowFilter(window)}
  AND properties.$host = '${PRODUCTION_HOST}'
  AND properties.$pathname LIKE '/en/%'
  AND properties.$browser IS NOT NULL
  AND properties.$browser NOT IN ('Chrome Headless', 'Headless Chrome')`;
}

function windowFilter(window) {
  return `timestamp >= ${timestampExpression(window.start)}
  AND timestamp < ${timestampExpression(window.end)}`;
}

export function timestampExpression(value) {
  return `parseDateTimeBestEffort('${requireIsoTimestamp(value)}')`;
}

async function queryPostHog(token, query) {
  const response = await fetch(POSTHOG_API, {
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  const body = await response.json();
  if (!response.ok || body.error) {
    throw new Error(`PostHog query failed: ${body.error ?? response.status}`);
  }

  return body.results.map((values) =>
    Object.fromEntries(
      body.columns.map((column, index) => [column, values[index]]),
    ),
  );
}

async function verifyRoutes(rows) {
  return Promise.all(
    rows.map(async (row) => {
      try {
        const response = await fetch(
          `https://${PRODUCTION_HOST}${row.pathname}`,
          { method: 'HEAD', redirect: 'follow' },
        );
        return {
          finalUrl: response.url,
          ...normalizeRouteRow(row),
          status: response.status,
        };
      } catch {
        return {
          finalUrl: null,
          ...normalizeRouteRow(row),
          status: 0,
        };
      }
    }),
  );
}

async function readEnvFile(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return '';
    }
    throw error;
  }
}

async function listDocSourceFiles(root) {
  const docsRoot = resolve(root, 'content/docs/en');
  const files = [];

  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const entryPath = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(entryPath);
      } else if (/\.(?:md|mdx)$/.test(entry.name)) {
        files.push(relative(root, entryPath).split(sep).join('/'));
      }
    }
  }

  await visit(docsRoot);
  return files;
}

async function assertRepositoryFilesExist(root, sourceFiles) {
  for (const sourceFile of sourceFiles) {
    if (!(await fileExists(resolveInsideRoot(root, sourceFile)))) {
      throw new Error(
        `Configured remediation source does not exist: ${sourceFile}`,
      );
    }
  }
}

function parseEnv(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        const key = line.slice(0, separator).trim();
        const rawValue = line.slice(separator + 1).trim();
        const value =
          (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
          (rawValue.startsWith("'") && rawValue.endsWith("'"))
            ? rawValue.slice(1, -1)
            : rawValue;
        return [key, value];
      }),
  );
}

function quoteSqlString(value) {
  if (
    !/^\/en\/[A-Za-z0-9_./-]*$/.test(value) &&
    !/^[a-z0-9_$-]+$/.test(value)
  ) {
    throw new Error(`Unsafe SQL value: ${value}`);
  }
  return `'${value.replaceAll("'", "''")}'`;
}

function requireIsoTimestamp(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ISO timestamp: ${value}`);
  }
  return parsed.toISOString();
}

function resolveInsideRoot(root, relativePath) {
  const resolvedRoot = resolve(root);
  const resolvedPath = resolve(resolvedRoot, relativePath);
  if (
    resolvedPath !== resolvedRoot &&
    !resolvedPath.startsWith(`${resolvedRoot}${sep}`)
  ) {
    throw new Error(`Configured path escapes the repository: ${relativePath}`);
  }
  return resolvedPath;
}

async function readJsonIfExists(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function metricDelta(current, previous) {
  return {
    change: current - previous,
    changeRate: previous > 0 ? (current - previous) / previous : null,
    current,
    previous,
  };
}

function sumEventCounts(events) {
  return events.reduce((total, item) => total + Number(item.count ?? 0), 0);
}

function countBy(items, getKey) {
  return items.reduce((counts, item) => {
    const key = getKey(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function formatPercent(value) {
  return value === null || value === undefined
    ? '-'
    : `${(value * 100).toFixed(1)}%`;
}

function formatSignedPercent(value) {
  if (value === null || value === undefined) {
    return '-';
  }
  const percentage = (value * 100).toFixed(1);
  return `${value >= 0 ? '+' : ''}${percentage}%`;
}

function formatInteger(value) {
  return Number(value ?? 0).toLocaleString('en-US');
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  });
}
