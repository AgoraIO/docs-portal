'use client';

import { useId, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export type RTCTierId = 'audio' | 'hd' | 'full-hd' | '2k' | '2k-plus';
export type RTCModeId = 'interactive-live' | 'broadcast';

type RTCCoefficients = {
  broadcastAudience: number;
  host: number;
  interactiveAudience: number;
};

type RTCTier = {
  coefficients: RTCCoefficients;
  id: RTCTierId;
  label: string;
};

type RTCMode = {
  audienceCoefficientKey: keyof Pick<
    RTCCoefficients,
    'broadcastAudience' | 'interactiveAudience'
  >;
  audienceRole: string;
  id: RTCModeId;
  label: string;
};

export type RTCMinutesCalculatorInput = {
  audienceCount: number;
  durationMinutes: number;
  hostCount: number;
  mode: RTCModeId;
  tier: RTCTierId;
};

export type RTCMinutesBreakdownLine = {
  coefficient: number;
  count: number;
  exactStandardMinutes: number;
  label: string;
};

export type RTCMinutesCalculatorResult = {
  audienceLine: RTCMinutesBreakdownLine;
  exactStandardMinutes: number;
  hostLine: RTCMinutesBreakdownLine;
  mode: RTCMode;
  tier: RTCTier;
  totalStandardMinutes: number;
};

export const RTC_TIERS: RTCTier[] = [
  {
    id: 'audio',
    label: 'Audio',
    coefficients: {
      host: 1,
      interactiveAudience: 1,
      broadcastAudience: 0.57,
    },
  },
  {
    id: 'hd',
    label: 'HD Video',
    coefficients: {
      host: 4,
      interactiveAudience: 4,
      broadcastAudience: 2,
    },
  },
  {
    id: 'full-hd',
    label: 'Full HD Video',
    coefficients: {
      host: 9,
      interactiveAudience: 9,
      broadcastAudience: 4.57,
    },
  },
  {
    id: '2k',
    label: '2K Video',
    coefficients: {
      host: 16,
      interactiveAudience: 16,
      broadcastAudience: 8,
    },
  },
  {
    id: '2k-plus',
    label: '2K+ Video',
    coefficients: {
      host: 36,
      interactiveAudience: 36,
      broadcastAudience: 18,
    },
  },
];

export const RTC_MODES: RTCMode[] = [
  {
    id: 'interactive-live',
    label: 'Interactive live',
    audienceRole: 'Interactive live audience',
    audienceCoefficientKey: 'interactiveAudience',
  },
  {
    id: 'broadcast',
    label: 'Broadcast streaming',
    audienceRole: 'Broadcast streaming audience',
    audienceCoefficientKey: 'broadcastAudience',
  },
];

const DEFAULT_INPUT: RTCMinutesCalculatorInput = {
  durationMinutes: 60,
  mode: 'interactive-live',
  hostCount: 1,
  audienceCount: 10,
  tier: 'hd',
};

const selectClassName =
  'h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});
const wholeNumberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

function getTier(tierId: RTCTierId) {
  return RTC_TIERS.find((tier) => tier.id === tierId) ?? RTC_TIERS[1];
}

function getMode(modeId: RTCModeId) {
  return RTC_MODES.find((mode) => mode.id === modeId) ?? RTC_MODES[0];
}

function sanitizeDuration(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function sanitizeCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function parseNumberInput(value: string) {
  if (value.trim() === '') {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatWholeNumber(value: number) {
  return wholeNumberFormatter.format(value);
}

export function calculateRTCStandardMinutes(
  input: RTCMinutesCalculatorInput,
): RTCMinutesCalculatorResult {
  const durationMinutes = sanitizeDuration(input.durationMinutes);
  const hostCount = sanitizeCount(input.hostCount);
  const audienceCount = sanitizeCount(input.audienceCount);
  const tier = getTier(input.tier);
  const mode = getMode(input.mode);
  const hostCoefficient = tier.coefficients.host;
  const audienceCoefficient = tier.coefficients[mode.audienceCoefficientKey];
  const hostExactStandardMinutes =
    durationMinutes * hostCount * hostCoefficient;
  const audienceExactStandardMinutes =
    durationMinutes * audienceCount * audienceCoefficient;
  const exactStandardMinutes =
    hostExactStandardMinutes + audienceExactStandardMinutes;

  return {
    audienceLine: {
      coefficient: audienceCoefficient,
      count: audienceCount,
      exactStandardMinutes: audienceExactStandardMinutes,
      label: mode.audienceRole,
    },
    exactStandardMinutes,
    hostLine: {
      coefficient: hostCoefficient,
      count: hostCount,
      exactStandardMinutes: hostExactStandardMinutes,
      label: 'Host',
    },
    mode,
    tier,
    totalStandardMinutes: Math.ceil(exactStandardMinutes),
  };
}

function BreakdownLine({
  durationMinutes,
  line,
}: {
  durationMinutes: number;
  line: RTCMinutesBreakdownLine;
}) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <dt className="min-w-0 text-sm font-medium text-foreground">
        {line.label}
      </dt>
      <dd className="min-w-0 text-sm text-muted-foreground sm:text-right">
        {formatNumber(line.count)} x {formatNumber(durationMinutes)} min x{' '}
        {formatNumber(line.coefficient)} ={' '}
        <span className="font-medium text-foreground">
          {formatNumber(line.exactStandardMinutes)}
        </span>
      </dd>
    </div>
  );
}

export function RTCMinutesCalculator() {
  const durationId = useId();
  const modeId = useId();
  const hostCountId = useId();
  const audienceCountId = useId();
  const tierId = useId();
  const [durationMinutes, setDurationMinutes] = useState(
    String(DEFAULT_INPUT.durationMinutes),
  );
  const [mode, setMode] = useState<RTCModeId>(DEFAULT_INPUT.mode);
  const [hostCount, setHostCount] = useState(String(DEFAULT_INPUT.hostCount));
  const [audienceCount, setAudienceCount] = useState(
    String(DEFAULT_INPUT.audienceCount),
  );
  const [tier, setTier] = useState<RTCTierId>(DEFAULT_INPUT.tier);
  const parsedDurationMinutes = parseNumberInput(durationMinutes);
  const result = useMemo(
    () =>
      calculateRTCStandardMinutes({
        audienceCount: parseNumberInput(audienceCount),
        durationMinutes: parsedDurationMinutes,
        hostCount: parseNumberInput(hostCount),
        mode,
        tier,
      }),
    [audienceCount, hostCount, mode, parsedDurationMinutes, tier],
  );
  const sanitizedDurationMinutes = sanitizeDuration(parsedDurationMinutes);

  return (
    <Card className="not-prose my-6 overflow-hidden rounded-lg shadow-sm">
      <CardHeader className="border-border border-b p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <CardTitle className="text-lg tracking-normal">
              Standard minutes calculator
            </CardTitle>
            <CardDescription className="leading-6">
              Estimate basic-service usage before package deduction.
            </CardDescription>
          </div>
          <span className="w-fit rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
            Final total rounded up
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.82fr)]">
        <form
          aria-label="Standard minutes calculator"
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => event.preventDefault()}
        >
          <label
            className="flex min-w-0 flex-col gap-2 text-sm font-medium text-foreground"
            htmlFor={durationId}
          >
            <span>Session duration (minutes)</span>
            <Input
              id={durationId}
              min="0"
              onChange={(event) => setDurationMinutes(event.target.value)}
              step="0.1"
              type="number"
              value={durationMinutes}
            />
          </label>
          <label
            className="flex min-w-0 flex-col gap-2 text-sm font-medium text-foreground"
            htmlFor={modeId}
          >
            <span>Mode / streaming type</span>
            <select
              className={selectClassName}
              id={modeId}
              onChange={(event) => setMode(event.target.value as RTCModeId)}
              value={mode}
            >
              {RTC_MODES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label
            className="flex min-w-0 flex-col gap-2 text-sm font-medium text-foreground"
            htmlFor={hostCountId}
          >
            <span>Host count</span>
            <Input
              id={hostCountId}
              min="0"
              onChange={(event) => setHostCount(event.target.value)}
              step="1"
              type="number"
              value={hostCount}
            />
          </label>
          <label
            className="flex min-w-0 flex-col gap-2 text-sm font-medium text-foreground"
            htmlFor={audienceCountId}
          >
            <span>Audience count</span>
            <Input
              id={audienceCountId}
              min="0"
              onChange={(event) => setAudienceCount(event.target.value)}
              step="1"
              type="number"
              value={audienceCount}
            />
          </label>
          <label
            className="flex min-w-0 flex-col gap-2 text-sm font-medium text-foreground sm:col-span-2"
            htmlFor={tierId}
          >
            <span>Resolution / tier</span>
            <select
              className={selectClassName}
              id={tierId}
              onChange={(event) => setTier(event.target.value as RTCTierId)}
              value={tier}
            >
              {RTC_TIERS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </form>
        <section
          aria-label="Standard minutes estimate"
          aria-live="polite"
          className="flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-muted/25 p-4"
        >
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">
              Estimated Standard minutes
            </p>
            <p className="text-3xl font-semibold tabular-nums text-foreground">
              {formatWholeNumber(result.totalStandardMinutes)}
            </p>
            <p className="text-sm text-muted-foreground">
              Exact total before rounding:{' '}
              {formatNumber(result.exactStandardMinutes)} minutes
            </p>
          </div>
          <dl className="overflow-hidden rounded-lg border border-border bg-background">
            <BreakdownLine
              durationMinutes={sanitizedDurationMinutes}
              line={result.hostLine}
            />
            <div className="border-border border-t">
              <BreakdownLine
                durationMinutes={sanitizedDurationMinutes}
                line={result.audienceLine}
              />
            </div>
          </dl>
          <p className="text-xs leading-5 text-muted-foreground">
            Tier: {result.tier.label}. Audience ratio:{' '}
            {formatNumber(result.audienceLine.coefficient)} for{' '}
            {result.mode.label.toLowerCase()}.
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
