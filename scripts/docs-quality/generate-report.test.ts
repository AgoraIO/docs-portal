import { describe, expect, it } from 'vitest';
import {
  assertRemediationBacklog,
  assertReportPrivacy,
  attachPageSources,
  buildComparison,
  buildDocSourceIndex,
  buildJourneyInsights,
  buildMarkdownReport,
  buildRemediationBacklog,
  buildRiskLifecycle,
  buildWindows,
  classifyPage,
  evaluateDataHealth,
  evaluateInstrumentation,
  normalizeAgentBenchmarkSummary,
  percentile,
  reportPeriod,
  selectLatestBenchmarks,
  summarizeRemediationBacklog,
  timestampExpression,
} from './generate-report.mjs';

describe('docs quality report generator', () => {
  it('uses the agreed evidence thresholds and requires two signals', () => {
    const baselines = {
      helpfulRateP20: 0.7,
      rageSessionRateP80: 0.03,
    };

    expect(
      classifyPage(
        {
          feedbackVotes: 20,
          helpfulRate: 0.5,
          lcpP75: 3_100,
          pageviews: 140,
          rageSessionRate: 0.01,
          sessions: 120,
        },
        baselines,
      ),
    ).toMatchObject({
      evidenceLevel: 'full',
      negativeSignals: ['satisfaction', 'technical-experience'],
      status: 'needs-improvement',
    });

    expect(
      classifyPage(
        {
          feedbackVotes: 5,
          helpfulRate: 0,
          lcpP75: 1_900,
          pageviews: 150,
          rageSessionRate: 0.04,
          sessions: 120,
        },
        baselines,
      ),
    ).toMatchObject({
      negativeSignals: ['task-friction'],
      status: 'watch',
    });
  });

  it('marks low volume pages as insufficient and mid-volume pages as directional', () => {
    const baselines = {
      helpfulRateP20: null,
      rageSessionRateP80: 0.03,
    };
    const metrics = {
      feedbackVotes: 0,
      helpfulRate: null,
      lcpP75: null,
      pageviews: 40,
      rageSessionRate: 0,
      sessions: 29,
    };

    expect(classifyPage(metrics, baselines)).toMatchObject({
      evidenceLevel: 'insufficient',
      status: 'insufficient-evidence',
    });
    expect(classifyPage({ ...metrics, sessions: 30 }, baselines)).toMatchObject(
      {
        evidenceLevel: 'directional',
        status: 'watch',
      },
    );
  });

  it('computes deterministic nearest-rank percentiles', () => {
    expect(percentile([1, 2, 3, 4, 5], 0.8)).toBe(4);
    expect(percentile([], 0.8)).toBeNull();
  });

  it('builds non-overlapping current and previous windows', () => {
    const windows = buildWindows('2026-08-03T00:00:00.000Z', 7);

    expect(windows.current).toEqual({
      end: '2026-08-03T00:00:00.000Z',
      start: '2026-07-06T00:00:00.000Z',
      windowDays: 28,
    });
    expect(windows.previous).toEqual({
      end: '2026-07-06T00:00:00.000Z',
      start: '2026-06-08T00:00:00.000Z',
      windowDays: 28,
    });
    expect(windows.eventHealth.start).toBe('2026-07-27T00:00:00.000Z');
    expect(windows.previousEventHealth.end).toBe('2026-07-27T00:00:00.000Z');
  });

  it('uses a PostHog-supported timestamp parser', () => {
    expect(timestampExpression('2026-08-06T06:43:17.346497Z')).toBe(
      "parseDateTimeBestEffort('2026-08-06T06:43:17.346Z')",
    );
  });

  it('blocks decisions when PostHog data is stale', () => {
    expect(
      evaluateDataHealth(
        {
          earliest_event: '2026-06-01T00:00:00.000Z',
          latest_event: '2026-08-02T12:00:00.000Z',
        },
        '2026-08-03T00:00:00.000Z',
        48,
      ),
    ).toMatchObject({ decisionAuthorized: true, status: 'healthy' });

    expect(
      evaluateDataHealth(
        {
          earliest_event: '2026-06-01T00:00:00.000Z',
          latest_event: '2026-07-30T00:00:00.000Z',
        },
        '2026-08-03T00:00:00.000Z',
        48,
      ),
    ).toMatchObject({ decisionAuthorized: false, status: 'stale' });
  });

  it('distinguishes deployment, warm-up, failure, degradation, and healthy events', () => {
    const input = {
      asOf: '2026-08-03T00:00:00.000Z',
      config: {
        degradationRatio: 0.5,
        gracePeriodDays: 7,
        minimumPreviousEvents: 20,
        minimumSessions: 100,
      },
      currentEvents: [{ count: 0, event: 'docs_code_copied' }],
      currentSessions: 500,
      previousEvents: [{ count: 40, event: 'docs_code_copied' }],
    };

    expect(evaluateInstrumentation(input).status).toBe('not-deployed');
    expect(
      evaluateInstrumentation({
        ...input,
        config: { ...input.config, deployedAt: '2026-07-30T00:00:00.000Z' },
      }).status,
    ).toBe('warming-up');
    expect(
      evaluateInstrumentation({
        ...input,
        config: { ...input.config, deployedAt: '2026-07-01T00:00:00.000Z' },
      }).status,
    ).toBe('instrumentation-failure');
    expect(
      evaluateInstrumentation({
        ...input,
        config: { ...input.config, deployedAt: '2026-07-01T00:00:00.000Z' },
        currentEvents: [{ count: 10, event: 'docs_code_copied' }],
      }).status,
    ).toBe('instrumentation-degraded');
    expect(
      evaluateInstrumentation({
        ...input,
        config: { ...input.config, deployedAt: '2026-07-01T00:00:00.000Z' },
        currentEvents: [{ count: 30, event: 'docs_code_copied' }],
      }).status,
    ).toBe('healthy');
  });

  it('tracks new, ongoing, and resolved weekly risks', () => {
    const risks = buildRiskLifecycle(
      [
        { id: 'route:/a', kind: 'route-health', severity: 'high' },
        { id: 'page:/c', kind: 'page-quality', severity: 'high' },
      ],
      {
        risks: [
          {
            firstSeen: '2026-07-20T00:00:00.000Z',
            id: 'route:/a',
            kind: 'route-health',
            lastSeen: '2026-07-27T00:00:00.000Z',
            lifecycle: 'new',
            occurrences: 1,
            severity: 'high',
          },
          {
            firstSeen: '2026-07-20T00:00:00.000Z',
            id: 'route:/b',
            kind: 'route-health',
            lastSeen: '2026-07-27T00:00:00.000Z',
            lifecycle: 'ongoing',
            occurrences: 2,
            severity: 'high',
          },
        ],
      },
      '2026-08-03T00:00:00.000Z',
    );

    expect(risks.find((risk) => risk.id === 'route:/a')).toMatchObject({
      lifecycle: 'ongoing',
      occurrences: 2,
    });
    expect(risks.find((risk) => risk.id === 'page:/c')).toMatchObject({
      lifecycle: 'new',
      occurrences: 1,
    });
    expect(risks.find((risk) => risk.id === 'route:/b')).toMatchObject({
      lifecycle: 'resolved',
      occurrences: 2,
    });
  });

  it('only compares complete previous windows', () => {
    const input = {
      currentPages: [{ pathname: '/en/a', status: 'healthy' }],
      currentJourneys: {
        topPaths: [{ pathKey: '/en/a > /en/b', sessions: 12 }],
      },
      currentTotals: { pageviews: 240, sessions: 120 },
      previousJourneys: {
        topPaths: [{ pathKey: '/en/a > /en/b', sessions: 10 }],
      },
      previousPages: [{ pathname: '/en/a', status: 'watch' }],
      previousTotals: { pageviews: 200, sessions: 100 },
    };

    expect(buildComparison({ ...input, available: false })).toMatchObject({
      available: false,
      totals: null,
    });
    expect(buildComparison({ ...input, available: true })).toMatchObject({
      available: true,
      pageStatusChanges: [
        {
          currentStatus: 'healthy',
          pathname: '/en/a',
          previousStatus: 'watch',
        },
      ],
      totals: {
        sessions: { change: 20, changeRate: 0.2 },
      },
      topJourneyPathChanges: [
        {
          pathKey: '/en/a > /en/b',
          sessions: { change: 2, changeRate: 0.2, current: 12, previous: 10 },
        },
      ],
    });
  });

  it('normalizes anonymous aggregate journey paths for reporting', () => {
    expect(
      buildJourneyInsights({
        pathRows: [
          {
            pageviews: 30,
            path: '/en/introduction > /en/ai > /en/ai/get-started/quickstart',
            sessions: 12,
          },
          {
            pageviews: 2,
            path: '/zh-CN/introduction > /zh-CN/ai',
            sessions: 1,
          },
        ],
        stepRows: [
          {
            event_count: 80,
            previous_page_transitions: 40,
            unique_sessions: 35,
          },
        ],
      }),
    ).toEqual({
      stepCoverage: {
        eventCount: 80,
        previousPageTransitions: 40,
        source: 'posthog-session-pageview-flow',
        uniqueSessions: 35,
      },
      topPaths: [
        {
          entryPathname: '/en/introduction',
          exitPathname: '/en/ai/get-started/quickstart',
          pageviews: 30,
          pathKey: '/en/introduction > /en/ai > /en/ai/get-started/quickstart',
          sessions: 12,
          transitions: [
            '/en/introduction',
            '/en/ai',
            '/en/ai/get-started/quickstart',
          ],
        },
      ],
    });
  });

  it('accepts only complete benchmark batches and selects the latest task batch', () => {
    const base = {
      batchId: 'batch-1',
      byVendor: {
        agora: { failed: 3, passed: 0, total: 3, passRate: 0 },
      },
      completedAt: '2026-08-01T00:00:00.000Z',
      overall: { failed: 3, passed: 0, total: 3, passRate: 0 },
      taskId: 'quickstart',
    };
    expect(
      normalizeAgentBenchmarkSummary(
        base,
        { validResults: 2 },
        'benchmark-artifact',
      ),
    ).toBeNull();

    const first = normalizeAgentBenchmarkSummary(
      base,
      { validResults: 3 },
      'benchmark-artifact',
    );
    const latest = normalizeAgentBenchmarkSummary(
      {
        ...base,
        batchId: 'batch-2',
        completedAt: '2026-08-02T00:00:00.000Z',
      },
      { validResults: 3 },
      'benchmark-artifact',
    );
    expect(selectLatestBenchmarks([first, latest])).toMatchObject([
      { batchId: 'batch-2', taskId: 'quickstart' },
    ]);
  });

  it('uses stable weekly and monthly archive periods', () => {
    expect(reportPeriod('weekly', '2026-08-03T00:00:00.000Z')).toBe('2026-W32');
    expect(reportPeriod('monthly', '2026-08-03T00:00:00.000Z')).toBe('2026-08');
  });

  it('maps monitored routes to repository source files', () => {
    const index = buildDocSourceIndex([
      'content/docs/en/introduction/index.mdx',
      'content/docs/en/ai/get-started/quickstart.mdx',
      'content/docs/en/api-reference/api-ref/rtc/index.mdx',
    ]);

    expect(index.get('/en/introduction')).toBe(
      'content/docs/en/introduction/index.mdx',
    );
    expect(index.get('/en/ai/get-started/quickstart')).toBe(
      'content/docs/en/ai/get-started/quickstart.mdx',
    );
    expect(index.get('/en/api-reference/api-ref/rtc')).toBe(
      'content/docs/en/api-reference/api-ref/rtc/index.mdx',
    );
    expect(
      attachPageSources(
        [
          {
            pathname: '/en/api-reference/api-ref/conversational-ai/join',
            sourceFile: 'content/openapi/conversational-ai/rest-api.en.yaml',
          },
        ],
        index,
      ),
    ).toEqual([
      {
        pathname: '/en/api-reference/api-ref/conversational-ai/join',
        sourceFile: 'content/openapi/conversational-ai/rest-api.en.yaml',
      },
    ]);
  });

  it('builds an issue-ready backlog and routes non-doc work separately', () => {
    const backlog = buildRemediationBacklog({
      dataHealth: { status: 'healthy' },
      instrumentation: { status: 'healthy' },
      pages: [
        {
          fcpP75: 4_200,
          goal: 'Complete the first integration.',
          lcpP75: 3_900,
          negativeSignals: ['task-friction', 'technical-experience'],
          pageType: 'task-guide',
          pathname: '/en/a',
          rageSessionRate: 0.04,
          sessions: 150,
          signalEvidence: [
            {
              comparison: 'above',
              metric: 'rageSessionRate',
              signal: 'task-friction',
              threshold: 0.03,
              value: 0.04,
            },
            {
              comparison: 'above',
              metric: 'lcpP75',
              signal: 'technical-experience',
              threshold: 2_500,
              value: 3_900,
            },
          ],
          sourceFile: 'content/docs/en/a.mdx',
          status: 'needs-improvement',
        },
      ],
      remediationTargets: {
        analytics: 'src/lib/analytics/posthog.ts',
        performance: 'src/routes/$locale/$tab/$.tsx',
        redirects: 'src/lib/legacy-sitemap/redirects.json',
        routeHandler: 'src/routes/$locale/$tab/$.tsx',
      },
      risks: [
        {
          evidence: {
            negativeSignals: ['task-friction', 'technical-experience'],
            sessions: 150,
          },
          id: 'page:/en/a',
          kind: 'page-quality',
          lifecycle: 'ongoing',
          pathname: '/en/a',
          severity: 'high',
        },
        {
          evidence: { sessions: 304, status: 404 },
          id: 'route:/en/legacy',
          kind: 'route-health',
          lifecycle: 'new',
          pathname: '/en/legacy',
          severity: 'high',
        },
      ],
    });

    expect(backlog).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          confidence: 'low',
          owner: 'docs',
          priority: 'P1',
          route: '/en/a',
          sourceFile: 'content/docs/en/a.mdx',
          status: 'needs-validation',
        }),
        expect.objectContaining({
          confidence: 'high',
          owner: 'frontend',
          route: '/en/a',
          sourceFile: 'src/routes/$locale/$tab/$.tsx',
          status: 'external-owner',
        }),
        expect.objectContaining({
          confidence: 'high',
          owner: 'docs',
          priority: 'P0',
          route: '/en/legacy',
          sourceFile: 'src/lib/legacy-sitemap/redirects.json',
          status: 'needs-validation',
        }),
      ]),
    );
    for (const item of backlog) {
      expect(item.acceptanceCriteria.length).toBeGreaterThan(0);
      expect(item.evidence).toBeTruthy();
      expect(item.proposedChange).toBeTruthy();
      expect(item.userImpact).toBeTruthy();
      expect(item.verification.length).toBeGreaterThan(0);
    }
    expect(() =>
      assertRemediationBacklog({
        remediationBacklog: backlog,
        remediationSummary: summarizeRemediationBacklog(backlog),
        risks: [],
        schemaVersion: 3,
      }),
    ).not.toThrow();
  });

  it('rejects remediation items without a route or repository source file', () => {
    expect(() =>
      assertRemediationBacklog({
        remediationBacklog: [
          {
            acceptanceCriteria: ['Done.'],
            confidence: 'low',
            diagnosis: 'Unknown.',
            evidence: { sessions: 10 },
            id: 'remediation:invalid',
            owner: 'docs',
            priority: 'P2',
            proposedChange: 'Validate the page.',
            riskId: 'page:/en/a',
            route: '/en/a',
            sourceFile: null,
            status: 'needs-validation',
            userImpact: 'The task may be blocked.',
            verification: ['Walk through the task.'],
          },
        ],
        remediationSummary: {
          byOwner: { docs: 1 },
          byStatus: { 'needs-validation': 1 },
          total: 1,
        },
        risks: [],
        schemaVersion: 3,
      }),
    ).toThrow('sourceFile');
  });

  it('enforces the v3 summary, exact-route, and evidence contract', () => {
    const item = {
      acceptanceCriteria: ['Complete the documented task.'],
      confidence: 'low',
      diagnosis: 'The exact content defect still needs validation.',
      evidence: { sessions: 120 },
      id: 'remediation:docs:/en/a',
      owner: 'docs',
      priority: 'P1',
      proposedChange: 'Validate and fix the first confirmed blocking step.',
      riskId: 'page:/en/a',
      route: '/en/a',
      sourceFile: 'content/docs/en/a.mdx',
      status: 'needs-validation',
      userImpact: 'The user may not complete the task.',
      verification: ['bun run types:check'],
    };
    const report = {
      remediationBacklog: [item],
      remediationSummary: {
        byOwner: { docs: 1 },
        byStatus: { 'needs-validation': 1 },
        total: 1,
      },
      risks: [],
      schemaVersion: 3,
    };

    expect(() => assertRemediationBacklog(report)).not.toThrow();
    expect(() =>
      assertRemediationBacklog({ ...report, schemaVersion: 2 }),
    ).toThrow('schemaVersion');
    expect(() =>
      assertRemediationBacklog({
        ...report,
        remediationSummary: { ...report.remediationSummary, total: 0 },
      }),
    ).toThrow('remediationSummary');
    expect(() =>
      assertRemediationBacklog({
        ...report,
        remediationBacklog: [{ ...item, route: '/en/**' }],
      }),
    ).toThrow('invalid route');
    expect(() =>
      assertRemediationBacklog({
        ...report,
        remediationBacklog: [{ ...item, evidence: {} }],
      }),
    ).toThrow('evidence');
  });

  it('renders weekly and monthly reports with separate evidence boundaries', () => {
    const base = {
      asOf: '2026-08-03T00:00:00.000Z',
      cognitiveHypotheses: [],
      dashboardUrl: null,
      dataHealth: { decisionAuthorized: true, status: 'healthy' },
      dataRange: { eventHealth: { windowDays: 7 } },
      generatedAt: '2026-08-03T00:01:00.000Z',
      instrumentation: {
        currentTotal: 20,
        previousTotal: 10,
        status: 'healthy',
      },
      journeyInsights: {
        stepCoverage: {
          previousPageTransitions: 25,
          source: 'posthog-session-pageview-flow',
          uniqueSessions: 40,
        },
        topPaths: [
          {
            pageviews: 30,
            sessions: 12,
            transitions: [
              '/en/introduction',
              '/en/ai',
              '/en/ai/get-started/quickstart',
            ],
          },
        ],
      },
      pages: [],
      risks: [],
      routeRisks: [],
      totals: {
        current: { pageviews: 100, sessions: 80 },
        previous: { pageviews: 90, sessions: 70 },
      },
    };
    const weekly = buildMarkdownReport({ ...base, reportType: 'weekly' });
    const monthly = buildMarkdownReport({
      ...base,
      agentBenchmarks: [],
      comparison: { available: false },
      decisions: [
        {
          decision: 'watch',
          reason: 'No threshold crossed.',
          target: 'portfolio',
        },
      ],
      reportType: 'monthly',
    });

    expect(weekly).toContain('Weekly Issue-ready Remediation Backlog');
    expect(weekly).toContain('本周执行清单');
    expect(weekly).toContain('本周不要做');
    expect(weekly).toContain('## 用户旅程路径');
    expect(weekly).toContain('`/en/introduction` -> `/en/ai`');
    expect(weekly).toContain('周报不推断用户心智');
    expect(monthly).toContain('Monthly Decision and Remediation Report');
    expect(monthly).toContain('## 用户旅程路径');
    expect(monthly).toContain('| Decision | Target |');
    expect(monthly).toContain('| watch | `portfolio` |');
    expect(monthly).toContain('不是对用户心智的直接测量');
    expect(monthly).toContain('不能代表产品接入完成');
  });

  it('renders docs-engineer owners, actions, and acceptance criteria', () => {
    const report = {
      asOf: '2026-08-06T08:00:00.000Z',
      dashboardUrl: null,
      dataHealth: { status: 'healthy' },
      dataRange: { eventHealth: { windowDays: 7 } },
      generatedAt: '2026-08-06T08:01:00.000Z',
      instrumentation: {
        currentTotal: 100,
        previousTotal: 0,
        status: 'warming-up',
      },
      journeyInsights: {
        stepCoverage: {
          previousPageTransitions: 0,
          source: 'posthog-session-pageview-flow',
          uniqueSessions: 0,
        },
        topPaths: [],
      },
      pages: [
        {
          fcpP75: 4_200,
          lcpP75: 3_900,
          pathname: '/en/a',
          sessions: 150,
          status: 'needs-improvement',
        },
      ],
      remediationBacklog: [
        {
          acceptanceCriteria: [
            '记录首个可复现阻塞步骤。',
            '确认后只修改对应段落。',
          ],
          confidence: 'low',
          diagnosis: '行为信号显示任务摩擦，但尚未定位到具体内容缺陷。',
          evidence: { sessions: 150, signals: ['task-friction'] },
          id: 'remediation:docs:/en/a',
          owner: 'docs',
          priority: 'P1',
          proposedChange: '走查任务并修改首个确认有歧义的步骤。',
          riskId: 'page:/en/a',
          route: '/en/a',
          sourceFile: 'content/docs/en/a.mdx',
          status: 'needs-validation',
          userImpact: '用户可能无法完成首次集成。',
          verification: ['bun run types:check', '人工完成首次集成。'],
        },
        {
          acceptanceCriteria: ['LCP p75 <= 2,500 ms。'],
          confidence: 'high',
          diagnosis: '页面性能超过阈值。',
          evidence: { lcpP75: 3_900, sessions: 150 },
          id: 'remediation:frontend:/en/a',
          owner: 'frontend',
          priority: 'P1',
          proposedChange: '定位并修复路由渲染或资源加载瓶颈。',
          riskId: 'page:/en/a',
          route: '/en/a',
          sourceFile: 'src/routes/$locale/$tab/$.tsx',
          status: 'external-owner',
          userImpact: '主要内容加载过慢。',
          verification: ['复测生产环境 LCP。'],
        },
      ],
      reportType: 'weekly',
      risks: [
        {
          evidence: { sessions: 304, status: 404 },
          id: 'route:/en/legacy',
          kind: 'route-health',
          lifecycle: 'new',
          pathname: '/en/legacy',
          severity: 'high',
        },
        {
          evidence: {
            negativeSignals: ['task-friction', 'technical-experience'],
            sessions: 150,
          },
          id: 'page:/en/a',
          kind: 'page-quality',
          lifecycle: 'new',
          pathname: '/en/a',
          severity: 'high',
        },
      ],
      totals: { current: { pageviews: 200, sessions: 160 } },
    };

    const markdown = buildMarkdownReport(report);

    expect(markdown).toContain('Issue-ready Remediation Backlog');
    expect(markdown).toContain('## 本周执行清单');
    expect(markdown).toContain('## 文档修复任务');
    expect(markdown).toContain('## 非文档问题分流');
    expect(markdown).toContain('`content/docs/en/a.mdx`');
    expect(markdown).toContain('诊断置信度：low');
    expect(markdown).toContain('bun run types:check');
    expect(markdown).toContain('数据新鲜度：正常');
    expect(markdown).toContain('埋点状态：刚上线观察期');
    expect(markdown).toContain('验收标准');
  });

  it('rejects secret-bearing report output', () => {
    expect(() => assertReportPrivacy('safe report')).not.toThrow();
    expect(() =>
      assertReportPrivacy('POSTHOG_PERSONAL_API_KEY=secret'),
    ).toThrow('Privacy validation failed');
  });
});
