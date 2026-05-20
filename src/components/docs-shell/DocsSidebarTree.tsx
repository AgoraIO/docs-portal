'use client';

import { Link } from '@tanstack/react-router';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
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
import { DocsConfiguredIcon } from './DocsConfiguredIcon';

type SidebarPageNode = Extract<DocsSidebarNode, { type: 'page' }>;
type SidebarSectionNode = Extract<DocsSidebarNode, { type: 'section' }>;
type RenderableSidebarSectionNode = SidebarSectionNode & {
  nestedQuickstartGroup?: SidebarSectionNode;
};

const sidebarToggleClassName =
  'h-[30px] items-center justify-between rounded-[7px] px-3 text-[13.5px] font-medium text-[color:var(--ink-3)] hover:bg-card hover:text-[color:var(--ink-1)]';

const sidebarSubButtonClassName =
  'h-[30px] rounded-[7px] px-3 text-[13px] text-[color:var(--ink-3)] hover:bg-card hover:text-[color:var(--ink-1)] data-[active=true]:bg-[color:var(--accent-brand-soft)] data-[active=true]:font-semibold data-[active=true]:text-[color:var(--accent-brand)]';

const sidebarPageButtonClassName =
  'relative h-[30px] items-center rounded-[7px] px-3 text-[13.5px] font-medium text-[color:var(--ink-3)] before:absolute before:left-1 before:top-1/2 before:h-3.5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-transparent hover:bg-card hover:text-[color:var(--ink-1)] data-[active=true]:bg-[color:var(--accent-brand-soft)] data-[active=true]:font-semibold data-[active=true]:text-[color:var(--accent-brand)] data-[active=true]:before:bg-[color:var(--accent-brand)]';

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
    mergeBuildIntoGettingStarted(mergeSdkQuickstartSection(nodes)),
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
      onSelectPath={onSelectPath}
      url={node.url}
    >
      {node.title}
    </SidebarPageLink>
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
  const defaultOpen =
    !node.collapsible ||
    node.children.some((child) => isNodeActive(child, activePath)) ||
    shouldDefaultOpenSection(node.title, activePath) ||
    node.title === 'Build';
  const [isOpen, setIsOpen] = useState(defaultOpen);
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

  if (!node.collapsible) {
    return (
      <div>
        <SidebarGroupLabel className="mt-4 mb-1 h-auto gap-2 px-2 text-[11px] font-semibold tracking-[0.06em] text-[color:var(--ink-4)] uppercase">
          <SidebarConfiguredIcon icon={node.icon} />
          <span
            className="block break-words leading-5 whitespace-normal"
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
            icon={node.nestedQuickstartGroup.icon}
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
        className={sidebarToggleClassName}
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2">
          <SidebarConfiguredIcon icon={node.icon} />
          <span className="block whitespace-normal">{node.title}</span>
        </span>
        <ChevronDownIcon
          className={cn(
            'size-4 shrink-0 transition-transform',
            isOpen ? 'rotate-0' : '-rotate-90',
          )}
        />
      </SidebarMenuButton>
      {isOpen ? (
        <SidebarMenuSub>
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
                  className={sidebarSubButtonClassName}
                  isActive={child.url === activePath}
                  size="md"
                >
                  <Link
                    onClick={onSelectPath}
                    params={{}}
                    search={{}}
                    to={child.url}
                  >
                    <span
                      className={cn(
                        'block overflow-hidden text-pretty leading-5 whitespace-normal',
                        '[-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]',
                      )}
                      title={child.title}
                    >
                      {child.title}
                    </span>
                  </Link>
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
  icon,
  onSelectPath,
  pages,
  title,
}: {
  activePath: string;
  icon?: string;
  onSelectPath: () => void;
  pages: SidebarPageNode[];
  title: string;
}) {
  const defaultOpen = pages.some((child) => child.url === activePath);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        aria-expanded={isOpen}
        className={sidebarToggleClassName}
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2">
          <SidebarConfiguredIcon icon={icon} />
          <span className="block whitespace-normal">{title}</span>
        </span>
        <ChevronDownIcon
          className={cn(
            'size-4 shrink-0 transition-transform',
            isOpen ? 'rotate-0' : '-rotate-90',
          )}
        />
      </SidebarMenuButton>
      {isOpen ? (
        <SidebarMenuSub>
          {pages.map((child) => (
            <SidebarMenuSubItem key={child.id}>
              <SidebarMenuSubButton
                asChild
                className={sidebarSubButtonClassName}
                isActive={child.url === activePath}
                size="md"
              >
                <Link
                  onClick={onSelectPath}
                  params={{}}
                  search={{}}
                  to={child.url}
                >
                  <span
                    className={cn(
                      'block overflow-hidden text-pretty leading-5 whitespace-normal',
                      '[-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]',
                    )}
                    title={child.title}
                  >
                    {child.title}
                  </span>
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
  const defaultOpen =
    !node.collapsible ||
    node.children.some((child) => isNodeActive(child, activePath)) ||
    node.title === 'Build';
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="w-full">
      <button
        aria-expanded={isOpen}
        className={cn('flex w-full text-left', sidebarToggleClassName)}
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2">
          <SidebarConfiguredIcon icon={node.icon} />
          <span className="block whitespace-normal">{node.title}</span>
        </span>
        <ChevronDownIcon
          className={cn(
            'mt-0.5 size-4 shrink-0 transition-transform',
            isOpen ? 'rotate-0' : '-rotate-90',
          )}
        />
      </button>
      {isOpen ? (
        <div className="mt-1 flex flex-col gap-1 pl-3">
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
                className={sidebarSubButtonClassName}
                isActive={child.url === activePath}
                key={child.id}
                size="md"
              >
                <Link
                  onClick={onSelectPath}
                  params={{}}
                  search={{}}
                  to={child.url}
                >
                  <span
                    className={cn(
                      'block overflow-hidden text-pretty leading-5 whitespace-normal',
                      '[-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]',
                    )}
                    title={child.title}
                  >
                    {child.title}
                  </span>
                </Link>
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

function normalizeRootSections(
  nodes: Array<DocsSidebarNode | RenderableSidebarSectionNode>,
) {
  return nodes.map((node) =>
    node.type === 'section'
      ? {
          ...node,
          collapsible: false,
        }
      : node,
  );
}

function SidebarPageLink({
  activePath,
  children,
  onSelectPath,
  url,
}: {
  activePath: string;
  children: string;
  onSelectPath: () => void;
  url: string;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={sidebarPageButtonClassName}
        isActive={url === activePath}
      >
        <Link onClick={onSelectPath} params={{}} search={{}} to={url}>
          <span
            className={cn(
              'block overflow-hidden text-pretty leading-5 whitespace-normal',
              '[-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]',
            )}
            title={children}
          >
            {children}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarConfiguredIcon({ icon }: { icon?: string }) {
  return (
    <span aria-hidden="true" className="docs-side-icon">
      <DocsConfiguredIcon className="size-3.5" icon={icon} />
    </span>
  );
}
