'use client';

import { PlusIcon, RotateCcwIcon, SaveIcon, Trash2Icon } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

type RTCStreamingMode = 'interactive' | 'broadcast';
type RTCUserRole = 'Host' | 'Audience';
type RTCResolutionClassification =
  | 'Audio'
  | 'Video HD'
  | 'Video Full HD'
  | 'Video 2K'
  | 'Video 2K+';

type RTCResolutionOption = {
  height: number;
  label: string;
  width: number;
};

type RTCMinutesCalculatorType = 'audio' | 'default';

export type RTCStream = {
  id: string;
  resolution: string;
};

export type RTCUser = {
  audienceCount: number;
  id: string;
  streams: RTCStream[];
  subscriptions: string[];
};

export type RTCCalculatedUser = RTCUser & {
  aggregateResolution: number;
  classification: RTCResolutionClassification;
  perUserStandardMinutes: string;
  ratio: number;
  role: RTCUserRole;
  standardMinutes: string;
};

export type RTCUserStandardMinutesInput = {
  durationMinutes: number;
  resolutions?: RTCResolutionOption[];
  streamingMode: RTCStreamingMode;
  users: RTCUser[];
};

export type RTCUserStandardMinutesResult = {
  totalStandardMinutes: string;
  users: RTCCalculatedUser[];
};

const MAX_DURATION_MINUTES = 1440;

const RESOLUTIONS: RTCResolutionOption[] = [
  { label: '640 x 480', width: 640, height: 480 },
  { label: '960 x 720', width: 960, height: 720 },
  { label: '1280 x 720', width: 1280, height: 720 },
  { label: '1920 x 1080', width: 1920, height: 1080 },
  { label: '2560 x 1440', width: 2560, height: 1440 },
  { label: '4096 x 2160', width: 4096, height: 2160 },
  { label: 'Audio only', width: 0, height: 0 },
];

const AUDIO_RESOLUTIONS: RTCResolutionOption[] = [
  { label: 'Audio only', width: 0, height: 0 },
];

const CONVERSION_RATIOS: Record<RTCResolutionClassification, number> = {
  Audio: 1,
  'Video HD': 4,
  'Video Full HD': 9,
  'Video 2K': 16,
  'Video 2K+': 36,
};

const BROADCAST_AUDIENCE_RATIOS: Record<RTCResolutionClassification, number> = {
  Audio: 0.57,
  'Video HD': 2,
  'Video Full HD': 4.57,
  'Video 2K': 8,
  'Video 2K+': 18,
};

const selectClassName =
  'h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

const numberFormatter = new Intl.NumberFormat('en-US');

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getUserLabel(index: number) {
  return `User ${String.fromCharCode(65 + index)}`;
}

function sanitizeDuration(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), MAX_DURATION_MINUTES);
}

function sanitizeAudienceCount(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.trunc(value));
}

function parseNumberInput(value: string) {
  if (value.trim() === '') {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function getStorageKey(type: RTCMinutesCalculatorType) {
  return type === 'audio'
    ? 'pricingCalculatorConfigAudio'
    : 'pricingCalculatorConfig';
}

function getResolution(
  resolutionLabel: string,
  resolutions: RTCResolutionOption[],
) {
  return (
    resolutions.find((resolution) => resolution.label === resolutionLabel) ??
    resolutions[0]
  );
}

function getAllStreams(users: RTCUser[]) {
  return users.flatMap((user) => user.streams);
}

function getUserRole(user: RTCUser): RTCUserRole {
  return user.streams.length > 0 ? 'Host' : 'Audience';
}

export function getRTCResolutionClassification(
  totalResolution: number,
): RTCResolutionClassification {
  if (totalResolution > 0 && totalResolution <= 921_600) {
    return 'Video HD';
  }

  if (totalResolution > 921_600 && totalResolution <= 2_073_600) {
    return 'Video Full HD';
  }

  if (totalResolution > 2_073_600 && totalResolution <= 3_686_400) {
    return 'Video 2K';
  }

  if (totalResolution > 3_686_400) {
    return 'Video 2K+';
  }

  return 'Audio';
}

export function calculateRTCAggregateResolution(
  user: RTCUser,
  users: RTCUser[],
  resolutions: RTCResolutionOption[] = RESOLUTIONS,
) {
  const streams = getAllStreams(users);

  return user.subscriptions.reduce((total, streamId) => {
    const stream = streams.find((candidate) => candidate.id === streamId);

    if (!stream) {
      return total;
    }

    const resolution = getResolution(stream.resolution, resolutions);

    return total + resolution.width * resolution.height;
  }, 0);
}

export function calculateRTCUserStandardMinutes({
  durationMinutes,
  resolutions = RESOLUTIONS,
  streamingMode,
  users,
}: RTCUserStandardMinutesInput): RTCUserStandardMinutesResult {
  const sanitizedDuration = sanitizeDuration(durationMinutes);
  const calculatedUsers = users.map((user) => {
    const role = getUserRole(user);
    const aggregateResolution = calculateRTCAggregateResolution(
      user,
      users,
      resolutions,
    );
    const classification = getRTCResolutionClassification(aggregateResolution);
    const ratio =
      role === 'Audience' && streamingMode === 'broadcast'
        ? BROADCAST_AUDIENCE_RATIOS[classification]
        : CONVERSION_RATIOS[classification];
    const perUserStandardMinutes = (sanitizedDuration * ratio).toFixed(2);
    const standardMinutes =
      role === 'Audience'
        ? (
            Number.parseFloat(perUserStandardMinutes) *
            sanitizeAudienceCount(user.audienceCount)
          ).toFixed(2)
        : perUserStandardMinutes;

    return {
      ...user,
      audienceCount: sanitizeAudienceCount(user.audienceCount),
      aggregateResolution,
      classification,
      perUserStandardMinutes,
      ratio,
      role,
      standardMinutes,
    };
  });
  const totalStandardMinutes = calculatedUsers
    .reduce((total, user) => total + Number.parseFloat(user.standardMinutes), 0)
    .toFixed(2);

  return {
    totalStandardMinutes,
    users: calculatedUsers,
  };
}

function formatDecimalString(value: string) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getAggregateResolutionExpression(
  user: RTCUser,
  users: RTCUser[],
  resolutions: RTCResolutionOption[],
) {
  const streams = getAllStreams(users);
  const parts = user.subscriptions
    .map((streamId) => {
      const stream = streams.find((candidate) => candidate.id === streamId);

      if (!stream) {
        return null;
      }

      const resolution = getResolution(stream.resolution, resolutions);

      if (resolution.width === 0) {
        return null;
      }

      return `(${resolution.width} x ${resolution.height})`;
    })
    .filter(Boolean);

  if (parts.length === 0) {
    return 'This user is not subscribed to any video streams. Time spent in a channel, not subscribed to video streams is counted as audio usage.';
  }

  return `= ${parts.join(' + ')}`;
}

function UserSummary({
  calculatedUser,
  durationMinutes,
  resolutions,
  user,
  userIndex,
  users,
}: {
  calculatedUser: RTCCalculatedUser;
  durationMinutes: number;
  resolutions: RTCResolutionOption[];
  user: RTCUser;
  userIndex: number;
  users: RTCUser[];
}) {
  return (
    <section
      aria-label={`Summary for ${getUserLabel(userIndex)}`}
      className="flex flex-col gap-3 rounded-md border border-border bg-muted/25 p-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{calculatedUser.role}</Badge>
        <span className="text-sm font-medium text-foreground">
          {getUserLabel(userIndex)} summary
        </span>
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-[12rem_minmax(0,1fr)]">
        <dt className="text-muted-foreground">Aggregate Resolution</dt>
        <dd className="min-w-0 text-foreground">
          {numberFormatter.format(calculatedUser.aggregateResolution)} pixels
          <span className="block text-xs leading-5 text-muted-foreground">
            {getAggregateResolutionExpression(user, users, resolutions)}
          </span>
        </dd>
        <dt className="text-muted-foreground">Aggregate Resolution Type</dt>
        <dd className="font-medium text-foreground">
          {calculatedUser.classification}
        </dd>
        <dt className="text-muted-foreground">Conversion Ratio</dt>
        <dd className="font-medium text-foreground">
          1 : {calculatedUser.ratio}
        </dd>
        <dt className="text-muted-foreground">Standard Minutes</dt>
        <dd className="font-medium text-foreground">
          {formatDecimalString(calculatedUser.perUserStandardMinutes)}
          {calculatedUser.audienceCount > 1 &&
            ` x ${calculatedUser.audienceCount}`}
          <span className="block text-xs leading-5 text-muted-foreground">
            = {durationMinutes} x {calculatedUser.ratio}
          </span>
        </dd>
      </dl>
    </section>
  );
}

export function RTCMinutesCalculator({
  type = 'default',
}: {
  type?: RTCMinutesCalculatorType;
}) {
  const durationInputId = useId();
  const resolutions = type === 'audio' ? AUDIO_RESOLUTIONS : RESOLUTIONS;
  const storageKey = getStorageKey(type);
  const [users, setUsers] = useState<RTCUser[]>([]);
  const [sessionDuration, setSessionDuration] = useState('60');
  const [streamingMode, setStreamingMode] =
    useState<RTCStreamingMode>('interactive');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const durationMinutes = sanitizeDuration(parseNumberInput(sessionDuration));
  const result = useMemo(
    () =>
      calculateRTCUserStandardMinutes({
        durationMinutes,
        resolutions,
        streamingMode,
        users,
      }),
    [durationMinutes, resolutions, streamingMode, users],
  );

  function addUser() {
    setUsers((previousUsers) => {
      const newUser: RTCUser = {
        id: createId(),
        streams: [],
        subscriptions: previousUsers.flatMap((user) =>
          user.streams.map((stream) => stream.id),
        ),
        audienceCount: 1,
      };

      return [...previousUsers, newUser];
    });
  }

  function removeUser(userId: string) {
    setUsers((previousUsers) => {
      const removedStreamIds =
        previousUsers
          .find((user) => user.id === userId)
          ?.streams.map((stream) => stream.id) ?? [];

      return previousUsers
        .filter((user) => user.id !== userId)
        .map((user) => ({
          ...user,
          subscriptions: user.subscriptions.filter(
            (streamId) => !removedStreamIds.includes(streamId),
          ),
        }));
    });
  }

  function addStream(userId: string) {
    const streamId = createId();

    setUsers((previousUsers) =>
      previousUsers.map((user) => {
        if (user.id === userId) {
          return {
            ...user,
            audienceCount: 1,
            streams: [
              ...user.streams,
              {
                id: streamId,
                resolution: resolutions[0].label,
              },
            ],
          };
        }

        return {
          ...user,
          subscriptions: [...user.subscriptions, streamId],
        };
      }),
    );
  }

  function removeStream(userId: string, streamId: string) {
    setUsers((previousUsers) =>
      previousUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              streams: user.streams.filter((stream) => stream.id !== streamId),
            }
          : {
              ...user,
              subscriptions: user.subscriptions.filter(
                (subscriptionId) => subscriptionId !== streamId,
              ),
            },
      ),
    );
  }

  function updateStreamResolution(
    userId: string,
    streamId: string,
    resolution: string,
  ) {
    setUsers((previousUsers) =>
      previousUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              streams: user.streams.map((stream) =>
                stream.id === streamId ? { ...stream, resolution } : stream,
              ),
            }
          : user,
      ),
    );
  }

  function toggleSubscription(userId: string, streamId: string) {
    setUsers((previousUsers) =>
      previousUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              subscriptions: user.subscriptions.includes(streamId)
                ? user.subscriptions.filter(
                    (subscriptionId) => subscriptionId !== streamId,
                  )
                : [...user.subscriptions, streamId],
            }
          : user,
      ),
    );
  }

  function updateAudienceCount(userId: string, value: string) {
    setUsers((previousUsers) =>
      previousUsers.map((user) =>
        user.id === userId
          ? { ...user, audienceCount: sanitizeAudienceCount(Number(value)) }
          : user,
      ),
    );
  }

  function clearAll() {
    setUsers([]);
    setSessionDuration('60');
    setStreamingMode('interactive');
  }

  function saveConfig() {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        users,
        sessionDuration,
        streamingMode,
      }),
    );
    setAlertMessage('Configuration saved successfully!');
  }

  function loadConfig() {
    try {
      const savedConfig = localStorage.getItem(storageKey);

      if (!savedConfig) {
        setAlertMessage('No saved configuration found!');
        return;
      }

      const config = JSON.parse(savedConfig) as {
        sessionDuration?: string | number;
        streamingMode?: RTCStreamingMode;
        users?: RTCUser[];
      };

      setUsers(config.users ?? []);
      setSessionDuration(String(config.sessionDuration ?? 60));
      setStreamingMode(config.streamingMode ?? 'interactive');
      setAlertMessage('Configuration loaded successfully!');
    } catch {
      setAlertMessage('Failed to load configuration.');
    }
  }

  return (
    <Card className="not-prose my-6 overflow-hidden rounded-lg shadow-sm">
      <CardHeader className="border-border border-b p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <CardTitle className="text-lg tracking-normal">
              Standard minutes calculator
            </CardTitle>
            <CardDescription className="leading-6">
              Estimate usage from users, published streams, subscriptions, and
              aggregate resolution.
            </CardDescription>
          </div>
          <Badge variant="outline">Stream subscriptions</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 p-4 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)]">
          <div className="flex flex-col gap-4">
            <label
              className="flex min-w-0 flex-col gap-2 text-sm font-medium text-foreground"
              htmlFor={durationInputId}
            >
              <span>Session Duration</span>
              <div className="flex items-center gap-2">
                <Input
                  className="max-w-32"
                  id={durationInputId}
                  max={MAX_DURATION_MINUTES}
                  min="0"
                  onChange={(event) =>
                    setSessionDuration(
                      String(sanitizeDuration(Number(event.target.value))),
                    )
                  }
                  type="number"
                  value={sessionDuration}
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
            </label>
            <Input
              aria-label="Use the slider to change the session duration or enter a number in the input box."
              max={MAX_DURATION_MINUTES}
              min="0"
              onChange={(event) =>
                setSessionDuration(
                  String(sanitizeDuration(Number(event.target.value))),
                )
              }
              type="range"
              value={durationMinutes}
            />
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium text-foreground">
                Streaming Mode
              </legend>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  checked={streamingMode === 'interactive'}
                  name="streamingMode"
                  onChange={(event) =>
                    setStreamingMode(event.target.value as RTCStreamingMode)
                  }
                  type="radio"
                  value="interactive"
                />
                Video Calling / Interactive Live Streaming
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  checked={streamingMode === 'broadcast'}
                  name="streamingMode"
                  onChange={(event) =>
                    setStreamingMode(event.target.value as RTCStreamingMode)
                  }
                  type="radio"
                  value="broadcast"
                />
                Broadcast Streaming (audience only)
              </label>
            </fieldset>
          </div>
          <section
            aria-live="polite"
            className="flex flex-col justify-between gap-3 rounded-md border border-border bg-muted/25 p-4"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">
                Total Standard Minutes
              </p>
              <p className="text-3xl font-semibold tabular-nums text-foreground">
                {formatDecimalString(result.totalStandardMinutes)}
              </p>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Broadcast Streaming rates apply to audience users only.
            </p>
          </section>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={addUser} type="button">
            <PlusIcon data-icon="inline-start" />
            Add a user
          </Button>
          <Button onClick={saveConfig} type="button" variant="outline">
            <SaveIcon data-icon="inline-start" />
            Save
          </Button>
          <Button onClick={loadConfig} type="button" variant="outline">
            Load
          </Button>
          <Button onClick={clearAll} type="button" variant="outline">
            <RotateCcwIcon data-icon="inline-start" />
            Start over
          </Button>
        </div>

        {alertMessage ? (
          <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
            {alertMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          {users.map((user, userIndex) => {
            const calculatedUser = result.users[userIndex];
            const publishedStreams = users
              .filter((otherUser) => otherUser.id !== user.id)
              .flatMap((otherUser) =>
                otherUser.streams.map((stream) => ({
                  ownerLabel: getUserLabel(users.indexOf(otherUser)),
                  stream,
                })),
              );

            return (
              <Card key={user.id} className="rounded-md shadow-none">
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base tracking-normal">
                        {getUserLabel(userIndex)}
                      </CardTitle>
                      <Badge variant="outline">{calculatedUser.role}</Badge>
                    </div>
                    <Button
                      aria-label={`Remove ${getUserLabel(userIndex)}`}
                      onClick={() => removeUser(user.id)}
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 p-4 pt-0">
                  {user.streams.length === 0 ? (
                    <label
                      className="flex max-w-56 flex-col gap-2 text-sm font-medium text-foreground"
                      htmlFor={`${user.id}-audience-count`}
                    >
                      <span>Number of such users</span>
                      <Input
                        id={`${user.id}-audience-count`}
                        min="1"
                        onChange={(event) =>
                          updateAudienceCount(user.id, event.target.value)
                        }
                        type="number"
                        value={user.audienceCount}
                      />
                    </label>
                  ) : null}

                  <div className="grid gap-4 lg:grid-cols-2">
                    <section className="flex min-w-0 flex-col gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-sm font-medium text-foreground">
                          Published Streams
                        </h4>
                        <Button
                          aria-label={`Add Stream for ${getUserLabel(userIndex)}`}
                          onClick={() => addStream(user.id)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <PlusIcon data-icon="inline-start" />
                          Add Stream
                        </Button>
                      </div>
                      {user.streams.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {user.streams.map((stream, streamIndex) => (
                            <div
                              className="flex min-w-0 items-center gap-2"
                              key={stream.id}
                            >
                              <select
                                aria-label={`Resolution for ${getUserLabel(
                                  userIndex,
                                )} stream ${streamIndex + 1}`}
                                className={selectClassName}
                                onChange={(event) =>
                                  updateStreamResolution(
                                    user.id,
                                    stream.id,
                                    event.target.value,
                                  )
                                }
                                value={stream.resolution}
                              >
                                {resolutions.map((resolution) => (
                                  <option
                                    key={resolution.label}
                                    value={resolution.label}
                                  >
                                    {resolution.label}
                                  </option>
                                ))}
                              </select>
                              <Button
                                aria-label={`Remove ${getUserLabel(
                                  userIndex,
                                )} stream ${streamIndex + 1}`}
                                onClick={() => removeStream(user.id, stream.id)}
                                size="icon-sm"
                                type="button"
                                variant="ghost"
                              >
                                <Trash2Icon />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No published streams.
                        </p>
                      )}
                    </section>

                    <section className="flex min-w-0 flex-col gap-3">
                      <h4 className="text-sm font-medium text-foreground">
                        Subscriptions
                      </h4>
                      {publishedStreams.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {publishedStreams.map(({ ownerLabel, stream }) => (
                            <label
                              className="flex items-center gap-2 text-sm text-foreground"
                              key={stream.id}
                            >
                              <input
                                checked={user.subscriptions.includes(stream.id)}
                                onChange={() =>
                                  toggleSubscription(user.id, stream.id)
                                }
                                type="checkbox"
                              />
                              {ownerLabel} - {stream.resolution}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No streams available to subscribe to.
                        </p>
                      )}
                    </section>
                  </div>

                  <Separator />
                  <UserSummary
                    calculatedUser={calculatedUser}
                    durationMinutes={durationMinutes}
                    resolutions={resolutions}
                    user={user}
                    userIndex={userIndex}
                    users={users}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-right text-lg font-semibold text-foreground">
          Total Standard Minutes:{' '}
          {formatDecimalString(result.totalStandardMinutes)}
        </div>
      </CardContent>
    </Card>
  );
}
