import {
  Children,
  type ComponentProps,
  cloneElement,
  createContext,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useContext,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { normalizeLocale } from '@/lib/i18n/i18n-config';
import { resources } from '@/lib/i18n/resources';
import {
  DocsCodeBlock as Pre,
  type DocsCodeBlockProps as PreProps,
} from '../DocsCodeBlock';
import { DocsTable } from './DocsTable';

type ParameterListVariant = 'cards' | 'table';
type ParameterListProps = ComponentProps<'div'> & {
  nullable?: boolean;
  optional?: boolean;
  required?: boolean;
  title?: ReactNode;
  variant?: ParameterListVariant;
};
type ParameterProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
  defaultValue?: ReactNode;
  direction?: ReactNode;
  name?: ReactNode;
  nullable?: boolean;
  optional?: boolean;
  possibleValues?: ReactNode;
  required?: boolean;
  type?: ReactNode;
};
type ParameterTypeProps = ComponentProps<'span'> & {
  children?: ReactNode;
};
type ApiSignatureProps = Omit<PreProps, 'title'> & {
  children?: ReactNode;
  labels?: string;
};
type ApiReturnsProps = ComponentProps<'section'> & {
  children?: ReactNode;
  title?: ReactNode;
};
type ApiReturnTypeProps = ComponentProps<'div'> & {
  children?: ReactNode;
};

const ParameterListVariantContext =
  createContext<ParameterListVariant>('cards');
const ParameterNestingContext = createContext(0);
const ParameterTableContext = createContext(false);
const TableParameterDescriptionContext = createContext(false);

// Keep the legacy MDX interface while sharing native table layout with GFM.
// Historical anchors belong to their parameter row, never directly in tbody.
function parameterRows(children: ReactNode, nested = false) {
  const rows: ReactNode[] = [];
  let prefix: ReactNode[] = [];
  for (const child of Children.toArray(children)) {
    if (isValidElement<ParameterProps>(child) && child.type === Parameter) {
      rows.push(
        cloneElement(
          child,
          undefined,
          ...prefix,
          ...Children.toArray(child.props.children),
        ),
      );
      prefix = [];
    } else if (!isBlankTextNode(child)) {
      prefix.push(child);
    }
  }
  if (prefix.length)
    rows.push(
      nested ? (
        <li key="remaining">{prefix}</li>
      ) : (
        <tr key="remaining">
          <td colSpan={2}>{prefix}</td>
        </tr>
      ),
    );
  return rows;
}

function ParameterList({
  children,
  className,
  nullable,
  optional,
  required,
  title,
  variant = 'cards',
  ...props
}: ParameterListProps) {
  const requiredState = getRequiredState({ optional, required });
  const nestingDepth = useContext(ParameterNestingContext);
  const { i18n } = useTranslation('common');
  const copy = resources[normalizeLocale(i18n.language) ?? 'en'].common.docs;

  if (nestingDepth > 0) {
    return (
      <ParameterListVariantContext value={variant}>
        <div className={className} {...props}>
          {title ? <p className="font-semibold">{title}</p> : null}
          <ParameterBadges requiredState={requiredState} nullable={nullable} />
          <ul
            className="my-2 list-disc space-y-2 pl-5"
            data-parameter-list=""
            data-parameter-nested="true"
            data-parameter-variant={variant}
          >
            {parameterRows(children, true)}
          </ul>
        </div>
      </ParameterListVariantContext>
    );
  }

  return (
    <ParameterListVariantContext value={variant}>
      <section
        className={className}
        data-parameter-list=""
        data-parameter-variant={variant}
        {...props}
      >
        <ParameterTableContext value={true}>
          <DocsTable>
            {title || requiredState || nullable ? (
              <caption className="pb-3 text-start font-semibold">
                {title}{' '}
                <ParameterBadges
                  requiredState={requiredState}
                  nullable={nullable}
                />
              </caption>
            ) : null}
            <thead>
              <tr>
                <th scope="col" data-table-column="0">
                  {copy.apiParameterName}
                </th>
                <th scope="col" data-table-column="1">
                  {copy.apiParameterDescription}
                </th>
              </tr>
            </thead>
            <tbody>{parameterRows(children)}</tbody>
          </DocsTable>
        </ParameterTableContext>
      </section>
    </ParameterListVariantContext>
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

function ParameterIdentity({
  compact,
  direction,
  name,
  nullable,
  requiredState,
  richType,
  type,
  variant,
}: {
  compact?: boolean;
  direction?: ReactNode;
  name?: ReactNode;
  nullable?: boolean;
  requiredState: 'required' | 'optional' | null;
  richType?: ReactNode;
  type?: ReactNode;
  variant: ParameterListVariant;
}) {
  if (variant === 'table') {
    return (
      <div
        className={cn(
          'min-w-0 break-words font-mono text-[0.8rem] text-fd-foreground leading-6',
          !compact && 'border-fd-border border-r px-4 py-4',
        )}
      >
        {requiredState === 'optional' ? (
          <span className="text-fd-muted-foreground">Optional </span>
        ) : null}
        {direction ? (
          <span className="text-fd-muted-foreground">{direction} </span>
        ) : null}
        {name ? (
          <code className="font-mono">
            {name}
            {requiredState === 'optional' ? '?' : null}
          </code>
        ) : null}
        {type || richType ? (
          <>
            {name ? ': ' : null}
            {type ? <span>{type}</span> : richType}
          </>
        ) : null}
        {nullable ? (
          <span className="text-fd-muted-foreground"> | null</span>
        ) : null}
      </div>
    );
  }

  return (
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
        ) : (
          richType
        )}
      </div>
      {direction ? (
        <span className="inline-flex w-fit rounded border border-fd-border bg-fd-muted/60 px-1.5 py-0.5 font-mono text-[0.68rem] text-fd-muted-foreground">
          {direction}
        </span>
      ) : null}
      <ParameterBadges requiredState={requiredState} nullable={nullable} />
    </div>
  );
}

function NestedParameterChildren({
  children,
  parameterLabel,
}: {
  children: ReactNode;
  parameterLabel?: string;
}) {
  const nestingDepth = useContext(ParameterNestingContext);
  const groups: ReactNode[] = [];
  let fields: ReactNode[] = [];
  const flush = () => {
    if (fields.length)
      groups.push(
        <ParameterList key={`fields-${groups.length}`}>{fields}</ParameterList>,
      );
    fields = [];
  };
  for (const child of Children.toArray(children)) {
    if (isValidElement(child) && child.type === ParameterList) {
      flush();
      groups.push(child);
    } else fields.push(child);
  }
  flush();

  return (
    <section
      aria-label={
        parameterLabel
          ? `Nested parameters for ${parameterLabel}`
          : 'Nested parameters'
      }
      className="mt-3"
      data-parameter-children=""
    >
      <ParameterNestingContext value={nestingDepth + 1}>
        {groups}
      </ParameterNestingContext>
    </section>
  );
}

function ParameterDescription({
  compact,
  defaultValue,
  descriptionChildren,
  nestedParameters,
  parameterLabel,
  possibleValues,
  variant,
}: {
  compact?: boolean;
  defaultValue?: ReactNode;
  descriptionChildren: ReactNode[];
  nestedParameters: ReactNode[];
  parameterLabel?: string;
  possibleValues?: ReactNode;
  variant: ParameterListVariant;
}) {
  return (
    <TableParameterDescriptionContext value={variant === 'table'}>
      <div
        className={cn(
          'prose-no-margin min-w-0 space-y-3 [&>:first-child]:mt-0 [&>:last-child]:mb-0',
          variant === 'table' && !compact && 'px-4 py-4',
          compact && 'mt-1',
        )}
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
        {nestedParameters.length > 0 && variant === 'table' ? (
          <NestedParameterChildren parameterLabel={parameterLabel}>
            {nestedParameters}
          </NestedParameterChildren>
        ) : null}
      </div>
    </TableParameterDescriptionContext>
  );
}

function Parameter({
  children,
  className,
  defaultValue,
  direction,
  name,
  nullable,
  optional,
  possibleValues,
  required,
  type,
  ...props
}: ParameterProps) {
  const requiredState = getRequiredState({ optional, required });
  const variant = useContext(ParameterListVariantContext);
  const childNodes = Children.toArray(children);
  const descriptionChildren = childNodes.filter(
    (child) =>
      !isNestedParameterBlock(child) &&
      !isParameterTypeBlock(child) &&
      !isDestinationAnchor(child) &&
      !isBlankTextNode(child),
  );
  const anchors = childNodes.filter(isDestinationAnchor);
  const nestedParameters = childNodes.filter(isNestedParameterBlock);
  const richType = childNodes.find(isParameterTypeBlock);
  const parameterLabel = getPlainTextLabel(name);
  const nestingDepth = useContext(ParameterNestingContext);
  const nativeTable = useContext(ParameterTableContext) && nestingDepth === 0;

  if (nestingDepth > 0) {
    return (
      <li
        className={className}
        data-parameter-item=""
        data-parameter-variant={variant}
        {...props}
      >
        {anchors}
        <ParameterIdentity
          compact
          direction={direction}
          name={name}
          nullable={nullable}
          requiredState={requiredState}
          richType={richType}
          type={type}
          variant="table"
        />
        <ParameterDescription
          compact
          defaultValue={defaultValue}
          descriptionChildren={descriptionChildren}
          nestedParameters={nestedParameters}
          parameterLabel={parameterLabel}
          possibleValues={possibleValues}
          variant={variant}
        />
        {nestedParameters.length > 0 && variant === 'cards' ? (
          <NestedParameterChildren parameterLabel={parameterLabel}>
            {nestedParameters}
          </NestedParameterChildren>
        ) : null}
      </li>
    );
  }

  if (nativeTable) {
    return (
      <tr
        className={className}
        data-parameter-item=""
        data-parameter-variant={variant}
        {...props}
      >
        <th scope="row" data-table-column="0">
          {anchors}
          <ParameterIdentity
            compact
            direction={direction}
            name={name}
            nullable={nullable}
            requiredState={requiredState}
            richType={richType}
            type={type}
            variant={variant}
          />
        </th>
        <td data-table-column="1">
          <ParameterDescription
            compact
            defaultValue={defaultValue}
            descriptionChildren={descriptionChildren}
            nestedParameters={nestedParameters}
            parameterLabel={parameterLabel}
            possibleValues={possibleValues}
            variant={variant}
          />
          {nestedParameters.length > 0 && variant === 'cards' ? (
            <NestedParameterChildren parameterLabel={parameterLabel}>
              {nestedParameters}
            </NestedParameterChildren>
          ) : null}
        </td>
      </tr>
    );
  }

  return (
    <div
      className={cn('group/parameter', className)}
      data-parameter-item=""
      data-parameter-variant={variant}
      {...props}
    >
      <div
        className={cn(
          'grid',
          variant === 'table'
            ? 'grid-cols-[minmax(0,42%)_minmax(0,1fr)] sm:grid-cols-[minmax(8rem,14rem)_minmax(0,1fr)]'
            : 'gap-3 px-4 py-4 sm:grid-cols-[minmax(0,16rem)_1fr]',
        )}
        data-parameter-main=""
      >
        {anchors}
        <ParameterIdentity
          direction={direction}
          name={name}
          nullable={nullable}
          requiredState={requiredState}
          richType={richType}
          type={type}
          variant={variant}
        />
        <ParameterDescription
          defaultValue={defaultValue}
          descriptionChildren={descriptionChildren}
          nestedParameters={nestedParameters}
          parameterLabel={parameterLabel}
          possibleValues={possibleValues}
          variant={variant}
        />
      </div>
      {nestedParameters.length > 0 && variant === 'cards' ? (
        <NestedParameterChildren parameterLabel={parameterLabel}>
          {nestedParameters}
        </NestedParameterChildren>
      ) : null}
    </div>
  );
}

function ParameterType({ children, className, ...props }: ParameterTypeProps) {
  return (
    <span
      className={cn(
        'min-w-0 font-mono text-[0.8rem] text-fd-muted-foreground [overflow-wrap:anywhere] [&_a]:text-fd-primary',
        className,
      )}
      data-parameter-type=""
      {...props}
    >
      {inlineMdxContent(children)}
    </span>
  );
}

function inlineMdxContent(children: ReactNode) {
  // MDX paragraph soft breaks are prose whitespace, not code line breaks.
  // Preserve linked/inline code nodes and explicit code values without parsing.
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === 'p'
      ? Children.toArray(child.props.children).map((inline) =>
          typeof inline === 'string'
            ? inline.replace(/[ \t]*\r?\n[ \t]*/g, ' ')
            : inline,
        )
      : [child],
  );
}

function ApiSignature({
  children,
  className,
  labels,
  ...props
}: ApiSignatureProps) {
  const labelItems = labels?.split(/\s+/).filter(Boolean) ?? [];
  return (
    <Pre
      {...props}
      className={className}
      data-api-signature=""
      data-line-numbers={false}
      title={
        labelItems.length ? (
          <div className="flex flex-wrap gap-2">
            {labelItems.map((label) => (
              <Badge
                className="rounded-md px-2 py-0.5 font-medium text-xs normal-case tracking-normal"
                data-api-modifier=""
                key={label}
                variant="outline"
              >
                {label}
              </Badge>
            ))}
          </div>
        ) : undefined
      }
    >
      <code className="[&_a]:text-fd-primary [&_a]:underline [&_a]:underline-offset-4">
        <span className="line">{inlineMdxContent(children)}</span>
      </code>
    </Pre>
  );
}

function ApiReturns({
  children,
  className,
  title = 'Returns',
  ...props
}: ApiReturnsProps) {
  const isTableParameterReturn = useContext(TableParameterDescriptionContext);
  const childNodes = Children.toArray(children);
  const returnType = childNodes.find(isApiReturnTypeBlock);
  const description = childNodes.filter(
    (child) => !isApiReturnTypeBlock(child) && !isBlankTextNode(child),
  );
  const { i18n } = useTranslation('common');
  const copy = resources[normalizeLocale(i18n.language) ?? 'en'].common.docs;
  if (isTableParameterReturn) return null;
  const hasDescription = description.some(
    (child) => !isDestinationAnchor(child),
  );
  if (!returnType && !hasDescription) return <>{description}</>;
  if (!hasDescription) {
    return (
      <section
        className={cn('my-4 space-y-2', className)}
        data-api-returns=""
        data-api-return-layout="type"
        {...props}
      >
        <p className="font-semibold">{title}</p>
        {description}
        {returnType}
      </section>
    );
  }
  return (
    <section className={className} data-api-returns="" {...props}>
      <DocsTable>
        <caption className="pb-3 text-start font-semibold">{title}</caption>
        <thead>
          <tr>
            {returnType ? <th scope="col">{copy.apiReturnType}</th> : null}
            <th scope="col">{copy.apiParameterDescription}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {returnType ? <td>{returnType}</td> : null}
            <td>
              <div className="prose-no-margin" data-api-return-description="">
                {description}
              </div>
            </td>
          </tr>
        </tbody>
      </DocsTable>
    </section>
  );
}

function ApiReturnType({ children, className, ...props }: ApiReturnTypeProps) {
  return (
    <div
      className={cn(
        'min-w-0 whitespace-pre-wrap font-mono text-fd-foreground [overflow-wrap:anywhere] [&_a]:text-fd-primary [&_a]:underline [&_a]:underline-offset-4 [&_p]:m-0 [&_p]:whitespace-pre-wrap',
        className,
      )}
      data-api-return-type=""
      {...props}
    >
      {children}
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

function isParameterTypeBlock(
  child: ReactNode,
): child is ReactElement<ParameterTypeProps> {
  return isValidElement(child) && child.type === ParameterType;
}

function isApiReturnTypeBlock(
  child: ReactNode,
): child is ReactElement<ApiReturnTypeProps> {
  return isValidElement(child) && child.type === ApiReturnType;
}

function isBlankTextNode(child: ReactNode) {
  return typeof child === 'string' && child.trim().length === 0;
}

function isDestinationAnchor(child: ReactNode) {
  return (
    isValidElement<ComponentProps<'a'> & { name?: string }>(child) &&
    child.type === 'a' &&
    Boolean(child.props.id || child.props.name) &&
    !child.props.href &&
    Children.toArray(child.props.children).every(isBlankTextNode)
  );
}

function getPlainTextLabel(value: ReactNode) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return undefined;
}

export {
  ApiReturns,
  ApiReturnType,
  ApiSignature,
  Parameter,
  ParameterList,
  ParameterType,
};

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
