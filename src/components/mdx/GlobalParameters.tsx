import {
  Children,
  type ComponentProps,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';

type ParameterListProps = ComponentProps<'div'> & {
  nullable?: boolean;
  optional?: boolean;
  required?: boolean;
  title?: ReactNode;
};
type ParameterProps = ComponentProps<'div'> & {
  children?: ReactNode;
  defaultValue?: ReactNode;
  name?: ReactNode;
  nullable?: boolean;
  optional?: boolean;
  possibleValues?: ReactNode;
  required?: boolean;
  type?: ReactNode;
};

function ParameterList({
  children,
  className,
  nullable,
  optional,
  required,
  title,
  ...props
}: ParameterListProps) {
  const requiredState = getRequiredState({ optional, required });

  return (
    <section
      className={cn(
        'not-prose my-6 overflow-hidden rounded-lg border border-fd-border bg-fd-card text-sm shadow-sm',
        className,
      )}
      data-parameter-list=""
      {...props}
    >
      {title || requiredState || nullable ? (
        <div className="flex flex-wrap items-center gap-2 border-fd-border border-b bg-fd-muted/35 px-4 py-3 font-semibold text-fd-foreground">
          {title ? <span>{title}</span> : null}
          <ParameterBadges requiredState={requiredState} nullable={nullable} />
        </div>
      ) : null}
      <div className="divide-y divide-fd-border">{children}</div>
    </section>
  );
}

function ParameterBadges({
  nullable,
  requiredState,
}: {
  nullable?: boolean;
  requiredState: 'required' | 'optional' | null;
}) {
  if (!requiredState && !nullable) {
    return null;
  }

  return (
    <span className="flex flex-wrap gap-1.5">
      {requiredState ? (
        <span
          className={cn(
            'rounded border px-1.5 py-0.5 text-[0.68rem] font-medium',
            requiredState === 'required'
              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300'
              : 'border-fd-border bg-fd-muted/60 text-fd-muted-foreground',
          )}
        >
          {requiredState}
        </span>
      ) : null}
      {nullable ? (
        <span className="rounded border border-fd-border bg-fd-muted/60 px-1.5 py-0.5 text-[0.68rem] font-medium text-fd-muted-foreground">
          nullable
        </span>
      ) : null}
    </span>
  );
}

function Parameter({
  children,
  className,
  defaultValue,
  name,
  nullable,
  optional,
  possibleValues,
  required,
  type,
  ...props
}: ParameterProps) {
  const requiredState = getRequiredState({ optional, required });
  const childNodes = Children.toArray(children);
  const descriptionChildren = childNodes.filter(
    (child) => !isNestedParameterBlock(child) && !isBlankTextNode(child),
  );
  const nestedParameters = childNodes.filter(isNestedParameterBlock);
  const parameterLabel = getPlainTextLabel(name);

  return (
    <div
      className={cn('group/parameter', className)}
      data-parameter-item=""
      {...props}
    >
      <div
        className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,16rem)_1fr]"
        data-parameter-main=""
      >
        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {name ? (
              <code className="rounded bg-fd-muted px-1.5 py-0.5 font-mono text-[0.82rem] text-fd-foreground">
                {name}
              </code>
            ) : null}
            {type ? (
              <span className="rounded border border-fd-border bg-fd-background px-1.5 py-0.5 font-mono text-[0.75rem] text-fd-muted-foreground">
                {type}
              </span>
            ) : null}
          </div>
          <ParameterBadges requiredState={requiredState} nullable={nullable} />
        </div>
        <div
          className="min-w-0 space-y-3 text-fd-muted-foreground [&>:first-child]:mt-0 [&>:last-child]:mb-0 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
          data-parameter-description=""
        >
          {defaultValue || possibleValues ? (
            <dl className="space-y-2 text-xs">
              {defaultValue ? (
                <div className="grid gap-1.5 sm:grid-cols-[max-content_minmax(0,1fr)]">
                  <dt className="font-medium text-fd-foreground">
                    Default value
                  </dt>
                  <dd className="min-w-0 break-words font-mono">
                    {defaultValue}
                  </dd>
                </div>
              ) : null}
              {possibleValues ? (
                <div className="grid gap-1.5 sm:grid-cols-[max-content_minmax(0,1fr)]">
                  <dt className="font-medium text-fd-foreground">
                    Possible values
                  </dt>
                  <dd className="min-w-0">
                    {renderPossibleValues(possibleValues, parameterLabel)}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          {descriptionChildren}
        </div>
      </div>
      {nestedParameters.length > 0 ? (
        <section
          aria-label={
            parameterLabel
              ? `Nested parameters for ${parameterLabel}`
              : 'Nested parameters'
          }
          className="border-fd-border/70 border-t bg-fd-muted/20 px-4 pb-4 pt-3"
          data-parameter-children=""
        >
          <div className="border-fd-border/80 border-l pl-3 sm:ml-4 sm:pl-4">
            <div className="overflow-hidden rounded-md border border-fd-border bg-fd-background/80 shadow-sm">
              <div className="divide-y divide-fd-border">
                {nestedParameters}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function renderPossibleValues(
  possibleValues: ReactNode,
  parameterLabel?: string,
) {
  const ariaLabel = parameterLabel
    ? `Possible values for ${parameterLabel}`
    : 'Possible values';

  if (typeof possibleValues === 'string') {
    const values = getPossibleValueItems(possibleValues);

    if (values.length > 0) {
      return (
        <ul
          aria-label={ariaLabel}
          className="m-0 flex min-w-0 list-none flex-wrap gap-1.5 p-0"
          data-parameter-possible-values=""
        >
          {values.map((value) => (
            <li key={value}>
              <code className="rounded border border-fd-border bg-fd-muted/60 px-1.5 py-0.5 font-mono text-[0.72rem] text-fd-foreground">
                {value}
              </code>
            </li>
          ))}
        </ul>
      );
    }
  }

  return (
    <span className="break-words font-mono" data-parameter-possible-values="">
      {possibleValues}
    </span>
  );
}

function getPossibleValueItems(possibleValues: string) {
  const trimmed = possibleValues.trim();

  if (isBracketedPossibleValue(trimmed)) {
    return [trimmed];
  }

  return trimmed
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function isBracketedPossibleValue(value: string) {
  return (
    (value.startsWith('[') && value.endsWith(']')) ||
    (value.startsWith('(') && value.endsWith(')'))
  );
}

function isNestedParameterBlock(
  child: ReactNode,
): child is ReactElement<ParameterProps | ParameterListProps> {
  return (
    isValidElement(child) &&
    (child.type === Parameter || child.type === ParameterList)
  );
}

function isBlankTextNode(child: ReactNode) {
  return typeof child === 'string' && child.trim().length === 0;
}

function getPlainTextLabel(value: ReactNode) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return undefined;
}

export { Parameter, ParameterList };

function getRequiredState({
  optional,
  required,
}: {
  optional?: boolean;
  required?: boolean;
}) {
  if (required) {
    return 'required';
  }

  if (optional || required === false) {
    return 'optional';
  }

  return null;
}
