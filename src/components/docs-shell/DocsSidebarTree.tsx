'use client';

import { Link } from '@tanstack/react-router';
import { ChevronDownIcon } from 'lucide-react';
import {
  type AnchorHTMLAttributes,
  forwardRef,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/cn';
import type { DocsSidebarNode } from '@/lib/docs-tree';

type SidebarPageNode = Extract<DocsSidebarNode, { type: 'page' }>;
type SidebarSectionNode = Extract<DocsSidebarNode, { type: 'section' }>;
type RenderableSidebarSectionNode = SidebarSectionNode & {
  nestedQuickstartGroup?: SidebarSectionNode;
};

const sidebarToggleClassName =
  'min-h-[28px] h-auto items-center justify-between rounded-[7px] px-3 py-1 text-[13px] font-medium text-[color:var(--ink-3)] hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)]';

const sidebarSectionTitleClassName =
  'block min-w-0 flex-1 break-words leading-5 whitespace-normal';

const sidebarSubButtonClassName =
  'relative min-h-[28px] h-auto items-center overflow-visible rounded-[7px] px-3 py-1 text-[12.75px] text-[color:var(--ink-3)] before:absolute before:left-1 before:top-1/2 before:h-3 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-transparent hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)] data-[active=true]:bg-[color:var(--accent-brand-soft)] data-[active=true]:font-semibold data-[active=true]:text-[color:var(--accent-brand)] data-[active=true]:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent-brand)_22%,transparent)] data-[active=true]:before:bg-[color:var(--accent-brand)] [&>span:last-child]:overflow-visible [&>span:last-child]:break-words [&>span:last-child]:whitespace-normal';

const sidebarPageButtonClassName =
  'relative min-h-[28px] h-auto items-center overflow-visible rounded-[7px] px-3 py-1 text-[13px] font-medium text-[color:var(--ink-3)] before:absolute before:left-1 before:top-1/2 before:h-3.5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-transparent hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)] data-[active=true]:bg-[color:var(--accent-brand-soft)] data-[active=true]:font-semibold data-[active=true]:text-[color:var(--accent-brand)] data-[active=true]:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent-brand)_22%,transparent)] data-[active=true]:before:bg-[color:var(--accent-brand)] [&>span:last-child]:overflow-visible [&>span:last-child]:break-words [&>span:last-child]:whitespace-normal';

const openApiSidebarButtonClassName =
  'h-auto min-h-[28px] items-center overflow-visible py-1';

const expandedSidebarChildrenClassName =
  'border-l border-[color:var(--line-strong)] pl-3';

const nestedExpandedSidebarChildrenClassName =
  'mt-0.5 flex flex-col gap-0.5 border-l border-[color:var(--line-strong)] pl-3';

const sidebarTitleOverrides: Array<[suffix: string, shortTitle: string]> = [];

export function DocsSidebarTree({
  activePath,
  nodes,
  onSelectPath,
}: {
  activePath: string;
  nodes: DocsSidebarNode[];
  onSelectPath: () => void;
}) {
  const renderableNodes = normalizeRootSections(
    mergeBestPracticesIntoBuild(
      mergeBuildIntoGettingStarted(mergeSdkQuickstartSection(nodes)),
    ),
  );

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {renderableNodes.map((node) => (
            <SidebarNodeRenderer
              activePath={activePath}
              key={node.id}
              node={node}
              onSelectPath={onSelectPath}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function SidebarNodeRenderer({
  activePath,
  node,
  onSelectPath,
}: {
  activePath: string;
  node: DocsSidebarNode | RenderableSidebarSectionNode;
  onSelectPath: () => void;
}) {
  if (node.type === 'section') {
    return (
      <SidebarSection
        activePath={activePath}
        node={node}
        onSelectPath={onSelectPath}
      />
    );
  }

  return (
    <SidebarPageLink
      activePath={activePath}
      external={node.external}
      href={node.href}
      linked={node.linked}
      method={node.method}
      onSelectPath={onSelectPath}
      title={node.title}
      url={node.url}
    />
  );
}

function SidebarSection({
  activePath,
  node,
  onSelectPath,
}: {
  activePath: string;
  node: RenderableSidebarSectionNode;
  onSelectPath: () => void;
}) {
  const hasActiveChild = node.children.some((child) =>
    isNodeActive(child, activePath),
  );
  const shouldDefaultOpen = shouldDefaultOpenSection(node.title, activePath);
  const canAutoOpen = node.defaultOpen !== false;
  const defaultOpen =
    !node.collapsible || (canAutoOpen && (hasActiveChild || shouldDefaultOpen));
  const shouldRevealActivePath =
    canAutoOpen && (hasActiveChild || shouldDefaultOpen);
  const [isOpen, setIsOpen] = useActivePathDisclosure(
    defaultOpen,
    shouldRevealActivePath,
    activePath,
  );
  const splitIndex = node.nestedQuickstartGroup
    ? Math.max(
        0,
        node.children.findIndex(
          (child) =>
            child.type === 'page' && child.url.endsWith('/enable-service'),
        ) + 1,
      )
    : node.children.length;
  const leadingChildren = node.children.slice(0, splitIndex);
  const trailingChildren = node.children.slice(splitIndex);

  if (node.url) {
    return (
      <SidebarLinkedSection
        activePath={activePath}
        collapsible={node.collapsible}
        defaultOpen={node.defaultOpen}
        items={node.children}
        onSelectPath={onSelectPath}
        title={node.title}
        url={node.url}
      />
    );
  }

  if (!node.collapsible) {
    return (
      <div>
        <SidebarGroupLabel className="mt-3 mb-1 h-auto gap-2 px-2 py-0.5 text-[11px] font-semibold tracking-[0.08em] text-[color:var(--ink-4)] uppercase">
          <span
            className="block min-w-0 flex-1 break-words leading-5 whitespace-normal"
            title={node.title}
          >
            {node.title.replaceAll('-', ' ')}
          </span>
        </SidebarGroupLabel>
        {leadingChildren.map((child) => (
          <SidebarNodeRenderer
            activePath={activePath}
            key={child.id}
            node={child}
            onSelectPath={onSelectPath}
          />
        ))}
        {node.nestedQuickstartGroup ? (
          <SidebarQuickstartGroup
            activePath={activePath}
            onSelectPath={onSelectPath}
            pages={node.nestedQuickstartGroup.children.filter(
              (child): child is SidebarPageNode => child.type === 'page',
            )}
            title={node.nestedQuickstartGroup.title}
          />
        ) : null}
        {trailingChildren.map((child) =>
          child.type === 'section' ? (
            <SidebarNestedSection
              activePath={activePath}
              key={child.id}
              node={child}
              onSelectPath={onSelectPath}
            />
          ) : (
            <SidebarNodeRenderer
              activePath={activePath}
              key={child.id}
              node={child}
              onSelectPath={onSelectPath}
            />
          ),
        )}
      </div>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        aria-expanded={isOpen}
        className={cn(sidebarToggleClassName, 'overflow-visible')}
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className={sidebarSectionTitleClassName}>{node.title}</span>
        </span>
        <ChevronDownIcon
          className={cn(
            'size-4 shrink-0 transition-transform',
            isOpen ? 'rotate-0' : '-rotate-90',
          )}
        />
      </SidebarMenuButton>
      {isOpen ? (
        <SidebarMenuSub className={expandedSidebarChildrenClassName}>
          {node.children.map((child) =>
            child.type === 'section' ? (
              <SidebarMenuSubItem key={child.id}>
                <SidebarNestedSection
                  activePath={activePath}
                  node={child}
                  onSelectPath={onSelectPath}
                />
              </SidebarMenuSubItem>
            ) : (
              <SidebarMenuSubItem key={child.id}>
                <SidebarMenuSubButton
                  asChild
                  className={sidebarEndpointButtonClassName(child.method)}
                  isActive={child.url === activePath}
                  size="md"
                >
                  <SidebarPageAnchor
                    external={child.external}
                    href={child.href}
                    onSelectPath={onSelectPath}
                    url={child.url}
                  >
                    <SidebarPageLabel
                      linked={child.linked}
                      method={child.method}
                      title={getSidebarDisplayTitle(child.title, child.url)}
                    />
                  </SidebarPageAnchor>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ),
          )}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
}

function SidebarLinkedSection({
  activePath,
  collapsible,
  defaultOpen: defaultOpenProp,
  items,
  onSelectPath,
  title,
  url,
}: {
  activePath: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  items: DocsSidebarNode[];
  onSelectPath: () => void;
  title: string;
  url: string;
}) {
  const hasActiveChild = items.some((child) => isNodeActive(child, activePath));
  const canAutoOpen = defaultOpenProp !== false;
  const shouldRevealActivePath =
    canAutoOpen && (hasActiveChild || url === activePath);
  const defaultOpen = !collapsible || shouldRevealActivePath;
  const [isOpen, setIsOpen] = useActivePathDisclosure(
    defaultOpen,
    shouldRevealActivePath,
    activePath,
  );

  if (items.length === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          className={cn(sidebarToggleClassName, 'overflow-visible')}
          isActive={url === activePath}
        >
          <Link onClick={onSelectPath} params={{}} search={{}} to={url}>
            <span className="flex min-w-0 items-center gap-2">
              <span className={sidebarSectionTitleClassName}>{title}</span>
            </span>
            <ChevronDownIcon className="size-4 shrink-0 -rotate-90" />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        aria-expanded={isOpen}
        className={cn(sidebarToggleClassName, 'overflow-visible')}
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className={sidebarSectionTitleClassName}>{title}</span>
        </span>
        <ChevronDownIcon
          className={cn(
            'size-4 shrink-0 transition-transform',
            isOpen ? 'rotate-0' : '-rotate-90',
          )}
        />
      </SidebarMenuButton>
      {isOpen ? (
        <SidebarMenuSub className={expandedSidebarChildrenClassName}>
          {items.map((child) =>
            child.type === 'section' ? (
              <SidebarMenuSubItem key={child.id}>
                <SidebarNestedSection
                  activePath={activePath}
                  node={child}
                  onSelectPath={onSelectPath}
                />
              </SidebarMenuSubItem>
            ) : (
              <SidebarMenuSubItem key={child.id}>
                <SidebarMenuSubButton
                  asChild
                  className={sidebarEndpointButtonClassName(child.method)}
                  isActive={child.url === activePath}
                  size="md"
                >
                  <SidebarPageAnchor
                    external={child.external}
                    href={child.href}
                    onSelectPath={onSelectPath}
                    url={child.url}
                  >
                    <SidebarPageLabel
                      linked={child.linked}
                      method={child.method}
                      title={getSidebarDisplayTitle(child.title, child.url)}
                    />
                  </SidebarPageAnchor>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ),
          )}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
}

function shouldDefaultOpenSection(title: string, activePath: string) {
  return (
    (title === 'Realtime' || title === '实时互动') &&
    /\/(en|zh-CN)\/introduction(?:\/index)?$/.test(activePath)
  );
}

function SidebarQuickstartGroup({
  activePath,
  onSelectPath,
  pages,
  title,
}: {
  activePath: string;
  onSelectPath: () => void;
  pages: SidebarPageNode[];
  title: string;
}) {
  const shouldRevealActivePath = pages.some(
    (child) => child.url === activePath,
  );
  const [isOpen, setIsOpen] = useActivePathDisclosure(
    shouldRevealActivePath,
    shouldRevealActivePath,
    activePath,
  );

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        aria-expanded={isOpen}
        className={cn(sidebarToggleClassName, 'overflow-visible')}
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className={sidebarSectionTitleClassName}>{title}</span>
        </span>
        <ChevronDownIcon
          className={cn(
            'size-4 shrink-0 transition-transform',
            isOpen ? 'rotate-0' : '-rotate-90',
          )}
        />
      </SidebarMenuButton>
      {isOpen ? (
        <SidebarMenuSub className={expandedSidebarChildrenClassName}>
          {pages.map((child) => (
            <SidebarMenuSubItem key={child.id}>
              <SidebarMenuSubButton
                asChild
                className={sidebarEndpointButtonClassName(child.method)}
                isActive={child.url === activePath}
                size="md"
              >
                <Link
                  onClick={onSelectPath}
                  params={{}}
                  search={{}}
                  to={child.url}
                >
                  <SidebarPageLabel
                    linked={child.linked}
                    method={child.method}
                    title={getSidebarDisplayTitle(child.title, child.url)}
                  />
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
}

function SidebarNestedSection({
  activePath,
  node,
  onSelectPath,
}: {
  activePath: string;
  node: SidebarSectionNode;
  onSelectPath: () => void;
}) {
  const hasActiveChild = node.children.some((child) =>
    isNodeActive(child, activePath),
  );
  const shouldDefaultOpen = shouldDefaultOpenSection(node.title, activePath);
  const canAutoOpen = node.defaultOpen !== false;
  const defaultOpen =
    !node.collapsible || (canAutoOpen && (hasActiveChild || shouldDefaultOpen));
  const shouldRevealActivePath =
    canAutoOpen && (hasActiveChild || shouldDefaultOpen);
  const [isOpen, setIsOpen] = useActivePathDisclosure(
    defaultOpen,
    shouldRevealActivePath,
    activePath,
  );
  return (
    <div className="w-full">
      <button
        aria-expanded={isOpen}
        className={cn(
          'flex w-full overflow-visible text-left',
          sidebarToggleClassName,
        )}
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className={sidebarSectionTitleClassName}>{node.title}</span>
        </span>
        <ChevronDownIcon
          className={cn(
            'mt-0.5 size-4 shrink-0 transition-transform',
            isOpen ? 'rotate-0' : '-rotate-90',
          )}
        />
      </button>
      {isOpen ? (
        <div className={nestedExpandedSidebarChildrenClassName}>
          {node.children.map((child) =>
            child.type === 'section' ? (
              <SidebarNestedSection
                activePath={activePath}
                key={child.id}
                node={child}
                onSelectPath={onSelectPath}
              />
            ) : (
              <SidebarMenuSubButton
                asChild
                className={sidebarEndpointButtonClassName(child.method)}
                isActive={child.url === activePath}
                key={child.id}
                size="md"
              >
                <SidebarPageAnchor
                  external={child.external}
                  href={child.href}
                  onSelectPath={onSelectPath}
                  url={child.url}
                >
                  <SidebarPageLabel
                    linked={child.linked}
                    method={child.method}
                    title={getSidebarDisplayTitle(child.title, child.url)}
                  />
                </SidebarPageAnchor>
              </SidebarMenuSubButton>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}

function isNodeActive(node: DocsSidebarNode, activePath: string): boolean {
  if (node.type === 'page') {
    return node.url === activePath;
  }

  return node.children.some((child) => isNodeActive(child, activePath));
}

function useActivePathDisclosure(
  defaultOpen: boolean,
  shouldRevealActivePath: boolean,
  activePath: string,
) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const activeRevealKey = shouldRevealActivePath ? activePath : undefined;

  useEffect(() => {
    if (activeRevealKey !== undefined) {
      setIsOpen(true);
    }
  }, [activeRevealKey]);

  return [isOpen, setIsOpen] as const;
}

function mergeSdkQuickstartSection(nodes: DocsSidebarNode[]) {
  const merged: Array<DocsSidebarNode | RenderableSidebarSectionNode> = [];

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    const nextNode = nodes[index + 1];

    if (
      node?.type === 'section' &&
      node.children.every((child) => child.type === 'page') &&
      (node.title === 'Getting Started' || node.title === '开始使用') &&
      nextNode?.type === 'section' &&
      nextNode.children.every((child) => child.type === 'page') &&
      (nextNode.title === 'SDK Quickstarts' ||
        nextNode.title === 'SDK 快速开始')
    ) {
      merged.push({
        ...node,
        nestedQuickstartGroup: nextNode,
      });
      index += 1;
      continue;
    }

    merged.push(node);
  }

  return merged;
}

function mergeBuildIntoGettingStarted(
  nodes: Array<DocsSidebarNode | RenderableSidebarSectionNode>,
) {
  const merged: Array<DocsSidebarNode | RenderableSidebarSectionNode> = [];

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    const nextNode = nodes[index + 1];

    if (
      node?.type === 'section' &&
      node.children.every((child) => child.type === 'page') &&
      (node.title === 'Get started' || node.title === '开始使用') &&
      nextNode?.type === 'section' &&
      nextNode.children.every((child) => child.type === 'page') &&
      nextNode.title === 'Build'
    ) {
      merged.push({
        ...node,
        children: [
          ...node.children,
          {
            ...nextNode,
            collapsible: true,
          },
        ],
      });
      index += 1;
      continue;
    }

    merged.push(node);
  }

  return merged;
}

function mergeBestPracticesIntoBuild(
  nodes: Array<DocsSidebarNode | RenderableSidebarSectionNode>,
) {
  const merged: Array<DocsSidebarNode | RenderableSidebarSectionNode> = [];

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    const nextNode = nodes[index + 1];

    if (
      node?.type === 'section' &&
      node.title === 'Build' &&
      nextNode?.type === 'section' &&
      nextNode.title === 'Best practices'
    ) {
      merged.push({
        ...node,
        children: [
          ...node.children,
          {
            ...nextNode,
            collapsible: true,
            icon: 'ShieldCheck',
            title: 'Harden and optimize',
          },
        ],
      });
      index += 1;
      continue;
    }

    merged.push(node);
  }

  return merged;
}

function normalizeRootSections(
  nodes: Array<DocsSidebarNode | RenderableSidebarSectionNode>,
) {
  // Linked sections (those with a url) manage their own collapsible state, so
  // don't force them always-open here — only plain root sections are flattened.
  return nodes.map((node) =>
    node.type === 'section' && !node.url
      ? {
          ...node,
          collapsible: false,
        }
      : node,
  );
}

function SidebarPageLink({
  activePath,
  external,
  href,
  linked,
  method,
  onSelectPath,
  title,
  url,
}: {
  activePath: string;
  external?: boolean;
  href?: string;
  linked?: boolean;
  method?: string;
  onSelectPath: () => void;
  title: string;
  url: string;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={cn(
          sidebarPageButtonClassName,
          method && openApiSidebarButtonClassName,
        )}
        isActive={url === activePath}
      >
        <SidebarPageAnchor
          external={external}
          href={href}
          onSelectPath={onSelectPath}
          url={url}
        >
          <SidebarPageLabel
            linked={linked}
            method={method}
            title={getSidebarDisplayTitle(title, url)}
          />
        </SidebarPageAnchor>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

type SidebarPageAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  external?: boolean;
  href?: string;
  onSelectPath: () => void;
  url: string;
};

const SidebarPageAnchor = forwardRef<HTMLAnchorElement, SidebarPageAnchorProps>(
  (
    {
      children,
      external,
      href,
      onClick,
      onSelectPath,
      rel,
      target,
      url,
      ...props
    },
    ref,
  ) => {
    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
      onClick?.(event);

      if (!event.defaultPrevented) {
        onSelectPath();
      }
    }

    if (external) {
      return (
        <a
          {...props}
          href={href ?? url}
          onClick={handleClick}
          ref={ref}
          rel={rel ?? 'noreferrer noopener'}
          target={target ?? '_blank'}
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        {...props}
        onClick={handleClick}
        params={{}}
        ref={ref}
        search={{}}
        to={url}
      >
        {children}
      </Link>
    );
  },
);

SidebarPageAnchor.displayName = 'SidebarPageAnchor';

function sidebarEndpointButtonClassName(method?: string) {
  return cn(sidebarSubButtonClassName, method && openApiSidebarButtonClassName);
}

function SidebarPageLabel({
  linked,
  method,
  title,
}: {
  linked?: boolean;
  method?: string;
  title: string;
}) {
  return (
    <>
      <span
        className={cn(
          'block min-w-0 flex-1 break-words text-pretty leading-5 whitespace-normal',
        )}
        title={title}
      >
        {title}
      </span>
      {method ? (
        <span className="ml-auto shrink-0 rounded border border-current/20 px-1.5 py-0.5 font-mono text-[10px] leading-none text-[color:var(--ink-4)]">
          {method}
        </span>
      ) : linked ? (
        <ChevronDownIcon className="ml-auto size-4 shrink-0 -rotate-90 text-[color:var(--ink-4)]" />
      ) : null}
    </>
  );
}

function getSidebarDisplayTitle(title: string, url: string) {
  for (const [suffix, shortTitle] of sidebarTitleOverrides) {
    if (url.endsWith(suffix)) {
      return shortTitle;
    }
  }

  return title;
}
