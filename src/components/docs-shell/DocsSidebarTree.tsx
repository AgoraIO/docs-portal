'use client';

import { Link } from '@tanstack/react-router';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/cn';
import type { DocsSidebarNode } from '@/lib/docs-tree';

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
          {nodes.map((node) =>
            node.type === 'section' ? (
              <div key={node.id}>
                <SidebarGroupLabel className="mt-3 px-2">
                  <span className="block truncate" title={node.title}>
                    {node.title.replaceAll('-', ' ')}
                  </span>
                </SidebarGroupLabel>
                {node.children.map((child) => (
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
            className={cn('block truncate')}
            title={children}
          >
            {children}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
