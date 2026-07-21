import { metaSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';

const docsMetaExternalPageLinkSchema = z.object({
  external: z.literal(true).optional(),
  href: z
    .string()
    .min(1)
    .refine((value) => !value.includes(')'), {
      message: 'External page href cannot contain a closing parenthesis.',
    }),
  title: z
    .string()
    .min(1)
    .refine((value) => !value.includes(']'), {
      message: 'External page title cannot contain a closing bracket.',
    }),
});

const docsMetaPageGroupSchema = z.object({
  collapsible: z.boolean().optional(),
  icon: z.string().min(1).optional(),
  pages: z
    .array(z.union([z.string().min(1), docsMetaExternalPageLinkSchema]))
    .min(1),
  sidebarHidden: z.boolean().optional(),
  title: z.string().min(1),
  type: z.literal('group'),
});

const sidebarGroupEndMarker = '---{flat}---';

const docsMetaPageEntrySchema = z.union([
  z.string(),
  docsMetaExternalPageLinkSchema.transform(
    (entry) => `external:[${entry.title}](${entry.href})`,
  ),
  docsMetaPageGroupSchema.transform((entry) => {
    const iconPrefix = entry.icon ? `[${entry.icon}]` : '';
    const flags = entry.sidebarHidden
      ? '{hidden}'
      : entry.collapsible === undefined
        ? ''
        : entry.collapsible
          ? '{dropdown}'
          : '{flat}';

    const resolvedPages = entry.pages.map((page) =>
      typeof page === 'string'
        ? page
        : `external:[${page.title}](${page.href})`,
    );

    return [
      `---${iconPrefix}${entry.title}${flags}---`,
      ...resolvedPages,
      sidebarGroupEndMarker,
    ];
  }),
]);

export const docsNavScopeVersionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  path: z.string().min(1),
});

export const docsNavScopeSchema = z.object({
  defaultVersion: z.string().min(1).optional(),
  platformTabs: z.boolean().optional(),
  presentation: z.enum(['dropdown', 'tabs']).optional(),
  sharedSidebar: z.boolean().optional(),
  versions: z.array(docsNavScopeVersionSchema).min(1).optional(),
});

export const docsMetaSchema = metaSchema.extend({
  navScope: docsNavScopeSchema.optional(),
  pages: z
    .array(docsMetaPageEntrySchema)
    .transform((entries) => entries.flat())
    .optional(),
  sidebarHidden: z.boolean().optional(),
  sidebarIndexTitle: z.string().min(1).optional(),
  sidebarLabels: z.record(z.string(), z.string().min(1)).optional(),
});

export type DocsMeta = z.infer<typeof docsMetaSchema>;
export type DocsNavScope = z.infer<typeof docsNavScopeSchema>;
export type DocsNavScopeVersion = z.infer<typeof docsNavScopeVersionSchema>;
