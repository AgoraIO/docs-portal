import { createHash } from 'node:crypto';
import { load } from 'cheerio';

/** Content evidence identifies rendered docs content, never a deployment commit.
 * Keep raw source bytes: code whitespace, href/src values, IDs, and hidden panels
 * are evidence, while deployment-specific head bundles and origins are not.
 */
export function docsContentEvidence(html) {
  const $ = load(html, { sourceCodeLocationInfo: true });
  const body = $('[data-static-docs-body]');
  const content = body.clone();
  content.find('script, style, template').remove();
  const skeletonSelector =
    '[data-testid="docs-content-skeleton"], [data-slot="skeleton"], [data-skeleton-line]';
  const skeleton =
    body.find(skeletonSelector).add(body.filter(skeletonSelector)).length > 0;
  const nonempty =
    content.text().replace(/\s+/g, '').length > 0 ||
    content.find('img, video, audio, table, pre, code').length > 0;
  const heading = $('article h1').first().length
    ? $('article h1').first()
    : $('h1').first();
  const title = $('title').first();
  const raw = (element) => {
    const location = element?.sourceCodeLocation;
    return location ? html.slice(location.startOffset, location.endOffset) : '';
  };
  const canonical = $('link[rel="canonical"]').first().attr('href');
  let canonicalPath;
  if (canonical) {
    try {
      canonicalPath = new URL(canonical, 'https://cn-link-audit.invalid')
        .pathname;
    } catch {
      // An invalid canonical URL cannot establish a route identity.
    }
  }
  return {
    contentDigest: createHash('sha256')
      .update(
        JSON.stringify({
          bodies: body.toArray().map(raw),
          heading: raw(heading[0]),
          title: raw(title[0]),
        }),
      )
      .digest('hex'),
    contentTitle: heading.text().trim() || title.text().trim(),
    ...(canonicalPath ? { canonicalPath } : {}),
    hasDocsBody: body.length > 0 && !skeleton && nonempty,
  };
}
