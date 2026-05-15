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

type SidebarPageNode = Extract<DocsSidebarNode, { type: 'page' }>;
type SidebarSectionNode = Extract<DocsSidebarNode, { type: 'section' }>;
type RenderableSidebarSectionNode = SidebarSectionNode & {
  nestedQuickstartGroup?: SidebarSectionNode;
};

export function DocsSidebarTree({
  activePath,
  nodes,
  onSelectPath,
}: {
  activePath: string;
  nodes: DocsSidebarNode[];
  onSelectPath: () => void;
}) {
  const renderableNodes = mergeSdkQuickstartSection(nodes);

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {renderableNodes.map((node) =>
            node.type === 'section' ? (
              <SidebarSection
                activePath={activePath}
                key={node.id}
                node={node}
                onSelectPath={onSelectPath}
              />
            ) : (
              <SidebarPageLink
                activePath={activePath}
                key={node.id}
                onSelectPath={onSelectPath}
                url={node.url}
              >
                {node.title}
              </SidebarPageLink>
            ),
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
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
    !node.collapsible || node.children.some((child) => child.url === activePath);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const splitIndex = node.nestedQuickstartGroup
    ? Math.max(
        0,
        node.children.findIndex((child) => child.url.endsWith('/enable-service')) +
          1,
      )
    : node.children.length;
  const leadingChildren = node.children.slice(0, splitIndex);
  const trailingChildren = node.children.slice(splitIndex);

  if (!node.collapsible) {
    return (
      <div>
        <SidebarGroupLabel className="mt-3 px-2">
          <span
            className="block break-words leading-5 whitespace-normal"
            title={node.title}
          >
            {node.title.replaceAll('-', ' ')}
          </span>
        </SidebarGroupLabel>
        {leadingChildren.map((child) => (
          <SidebarPageLink
            activePath={activePath}
            key={child.id}
            onSelectPath={onSelectPath}
            url={child.url}
          >
            {child.title}
          </SidebarPageLink>
        ))}
        {node.nestedQuickstartGroup ? (
          <SidebarQuickstartGroup
            activePath={activePath}
            children={node.nestedQuickstartGroup.children}
            onSelectPath={onSelectPath}
            title={node.nestedQuickstartGroup.title}
          />
        ) : null}
        {trailingChildren.map((child) => (
          <SidebarPageLink
            activePath={activePath}
            key={child.id}
            onSelectPath={onSelectPath}
            url={child.url}
          >
            {child.title}
          </SidebarPageLink>
        ))}
      </div>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        aria-expanded={isOpen}
        className="justify-between"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span className="block whitespace-normal">{node.title}</span>
        <ChevronDownIcon
          className={cn(
            'size-4 shrink-0 transition-transform',
            isOpen ? 'rotate-0' : '-rotate-90',
          )}
        />
      </SidebarMenuButton>
      {isOpen ? (
        <SidebarMenuSub>
          {node.children.map((child) => (
            <SidebarMenuSubItem key={child.id}>
              <SidebarMenuSubButton
                asChild
                isActive={child.url === activePath}
                size="md"
              >
                <Link onClick={onSelectPath} params={{}} search={{}} to={child.url}>
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

function SidebarQuickstartGroup({
  activePath,
  children,
  onSelectPath,
  title,
}: {
  activePath: string;
  children: SidebarPageNode[];
  onSelectPath: () => void;
  title: string;
}) {
  const defaultOpen = children.some((child) => child.url === activePath);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        aria-expanded={isOpen}
        className="justify-between"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span className="block whitespace-normal">{title}</span>
        <ChevronDownIcon
          className={cn(
            'size-4 shrink-0 transition-transform',
            isOpen ? 'rotate-0' : '-rotate-90',
          )}
        />
      </SidebarMenuButton>
      {isOpen ? (
        <SidebarMenuSub>
          {children.map((child) => (
            <SidebarMenuSubItem key={child.id}>
              <SidebarMenuSubButton
                asChild
                isActive={child.url === activePath}
                size="md"
              >
                <Link onClick={onSelectPath} params={{}} search={{}} to={child.url}>
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

function mergeSdkQuickstartSection(nodes: DocsSidebarNode[]) {
  const merged: Array<DocsSidebarNode | RenderableSidebarSectionNode> = [];

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    const nextNode = nodes[index + 1];

    if (
      node?.type === 'section' &&
      (node.title === 'Getting Started' || node.title === '开始使用') &&
      nextNode?.type === 'section' &&
      (nextNode.title === 'SDK Quickstarts' || nextNode.title === 'SDK 快速开始')
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
      <SidebarMenuButton asChild isActive={url === activePath}>
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
