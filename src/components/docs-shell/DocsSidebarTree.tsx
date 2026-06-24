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
import { DocsConfiguredIcon, hasConfiguredIcon } from './DocsConfiguredIcon';

type SidebarSectionNode = Extract<DocsSidebarNode, { type: 'section' }>;

const sidebarToggleClassName =
  'min-h-[34px] h-auto items-start justify-between rounded-[7px] px-3 py-1.5 text-[13px] font-medium text-[color:var(--ink-3)] hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)]';

const sidebarSectionTitleClassName =
  'block min-w-0 flex-1 break-words leading-5 whitespace-normal';

const sidebarSubButtonClassName =
  'min-h-[32px] h-auto items-start overflow-visible rounded-[7px] px-3 py-1.5 text-[12.75px] text-[color:var(--ink-3)] hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)] data-[active=true]:bg-[color:var(--accent-brand-soft)] data-[active=true]:text-[color:var(--accent-brand)] [&>span:last-child]:overflow-visible [&>span:last-child]:break-words [&>span:last-child]:whitespace-normal';

const sidebarPageButtonClassName =
  'relative min-h-[34px] h-auto items-start overflow-visible rounded-[7px] px-3 py-1.5 text-[13px] font-medium text-[color:var(--ink-3)] before:absolute before:left-1 before:top-1/2 before:h-3.5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-transparent hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)] data-[active=true]:bg-[color:var(--accent-brand-soft)] data-[active=true]:text-[color:var(--accent-brand)] data-[active=true]:before:bg-[color:var(--accent-brand)] [&>span:last-child]:overflow-visible [&>span:last-child]:break-words [&>span:last-child]:whitespace-normal';

const openApiSidebarButtonClassName =
  'h-auto min-h-[30px] items-start overflow-visible py-1.5';

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
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {nodes.map((node) => (
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
  node: DocsSidebarNode;
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
  node: SidebarSectionNode;
  onSelectPath: () => void;
}) {
  const defaultOpen =
    !node.collapsible ||
    node.children.some((child) => isNodeActive(child, activePath)) ||
    shouldDefaultOpenSection(node.title, activePath);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (node.url) {
    return (
      <SidebarLinkedSection
        activePath={activePath}
        children={node.children}
        collapsible={node.collapsible}
        icon={node.icon}
        onSelectPath={onSelectPath}
        title={node.title}
        url={node.url}
      />
    );
  }

  if (node.children.length === 0) {
    return (
      <SidebarPageLink
        activePath={activePath}
        onSelectPath={onSelectPath}
        title={node.title}
        url={node.url ?? node.id}
      />
    );
  }

  if (!node.collapsible) {
    return (
      <div>
        <SidebarGroupLabel className="mt-5 mb-2.5 h-auto gap-2 px-2 py-1 text-[11px] font-semibold tracking-[0.08em] text-[color:var(--ink-4)] uppercase">
          <SidebarConfiguredIcon icon={node.icon} />
          <span
            className="block min-w-0 flex-1 break-words leading-5 whitespace-normal"
            title={node.title}
          >
            {node.title.replaceAll('-', ' ')}
          </span>
        </SidebarGroupLabel>
        {node.children.map((child) =>
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
          <SidebarConfiguredIcon icon={node.icon} />
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
                      method={child.method}
                      title={getSidebarDisplayTitle(child.title, child.url)}
                    />
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

function SidebarLinkedSection({
  activePath,
  children,
  collapsible,
  icon,
  onSelectPath,
  title,
  url,
}: {
  activePath: string;
  children: DocsSidebarNode[];
  collapsible?: boolean;
  icon?: string;
  onSelectPath: () => void;
  title: string;
  url: string;
}) {
  const defaultOpen =
    !collapsible ||
    children.some((child) => isNodeActive(child, activePath)) ||
    url === activePath;
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (children.length === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          className={cn(sidebarToggleClassName, 'overflow-visible')}
          isActive={url === activePath}
        >
          <Link onClick={onSelectPath} params={{}} search={{}} to={url}>
            <span className="flex min-w-0 items-center gap-2">
              <SidebarConfiguredIcon icon={icon} />
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
      <div className="flex items-stretch gap-1">
        <SidebarMenuButton
          asChild
          className={cn(
            sidebarToggleClassName,
            'min-w-0 flex-1 justify-start overflow-visible',
          )}
          isActive={url === activePath}
        >
          <Link onClick={onSelectPath} params={{}} search={{}} to={url}>
            <span className="flex min-w-0 items-center gap-2">
              <SidebarConfiguredIcon icon={icon} />
              <span className={sidebarSectionTitleClassName}>{title}</span>
            </span>
          </Link>
        </SidebarMenuButton>
        <SidebarMenuButton
          aria-expanded={isOpen}
          className={cn(
            sidebarToggleClassName,
            'w-10 shrink-0 justify-center px-0',
          )}
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          <ChevronDownIcon
            className={cn(
              'size-4 shrink-0 transition-transform',
              isOpen ? 'rotate-0' : '-rotate-90',
            )}
          />
        </SidebarMenuButton>
      </div>
      {isOpen ? (
        <SidebarMenuSub>
          {children.map((child) =>
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
                  <Link
                    onClick={onSelectPath}
                    params={{}}
                    search={{}}
                    to={child.url}
                  >
                    <SidebarPageLabel
                      method={child.method}
                      title={getSidebarDisplayTitle(child.title, child.url)}
                    />
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

function SidebarNestedSection({
  activePath,
  node,
  onSelectPath,
}: {
  activePath: string;
  node: SidebarSectionNode;
  onSelectPath: () => void;
}) {
  if (node.url && node.children.length === 0) {
    return (
      <SidebarMenuSubButton
        asChild
        className={sidebarEndpointButtonClassName()}
        isActive={node.url === activePath}
        size="md"
      >
        <Link onClick={onSelectPath} params={{}} search={{}} to={node.url}>
          <SidebarPageLabel title={getSidebarDisplayTitle(node.title, node.url)} />
        </Link>
      </SidebarMenuSubButton>
    );
  }

  const defaultOpen =
    !node.collapsible ||
    node.children.some((child) => isNodeActive(child, activePath)) ||
    shouldDefaultOpenSection(node.title, activePath);
  const [isOpen, setIsOpen] = useState(defaultOpen);

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
          <SidebarConfiguredIcon icon={node.icon} />
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
        <div className="mt-1.5 flex flex-col gap-1.5 pl-3.5">
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
                <Link
                  onClick={onSelectPath}
                  params={{}}
                  search={{}}
                  to={child.url}
                >
                  <SidebarPageLabel
                    method={child.method}
                    title={getSidebarDisplayTitle(child.title, child.url)}
                  />
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

function SidebarPageLink({
  activePath,
  linked,
  method,
  onSelectPath,
  title,
  url,
}: {
  activePath: string;
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
        <Link onClick={onSelectPath} params={{}} search={{}} to={url}>
          <SidebarPageLabel
            linked={linked}
            method={method}
            title={getSidebarDisplayTitle(title, url)}
          />
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

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

function SidebarConfiguredIcon({ icon }: { icon?: string }) {
  if (!hasConfiguredIcon(icon)) {
    return null;
  }

  return (
    <span aria-hidden="true" className="docs-side-icon">
      <DocsConfiguredIcon className="size-3.5" icon={icon} />
    </span>
  );
}

function getSidebarDisplayTitle(title: string, url: string) {
  if (/\/solutions(?:\/index)?$/.test(url)) {
    return url.includes('/zh-CN/') ? '总览' : 'Overview';
  }

  for (const [suffix, shortTitle] of sidebarTitleOverrides) {
    if (url.endsWith(suffix)) {
      return shortTitle;
    }
  }

  return title;
}
