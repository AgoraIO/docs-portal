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

const docsMetaPageEntrySchema = z.union([
  z.string(),
  docsMetaExternalPageLinkSchema.transform(
    (entry) => `external:[${entry.title}](${entry.href})`,
  ),
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
  pages: z.array(docsMetaPageEntrySchema).optional(),
  sidebarIndexTitle: z.string().min(1).optional(),
});

export type DocsMeta = z.infer<typeof docsMetaSchema>;
export type DocsNavScope = z.infer<typeof docsNavScopeSchema>;
export type DocsNavScopeVersion = z.infer<typeof docsNavScopeVersionSchema>;
