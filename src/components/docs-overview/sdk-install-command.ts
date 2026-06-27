import type { SdkDownloadVersion } from './sdk-downloads-data';

export type InstallCommand = { tool: string; command: string };

/**
 * Derive a copyable install command from a version's package-registry URL.
 * The version is pinned only when the URL itself carries it (Maven, pub, unpkg);
 * npmjs / Swift Package Index / pypi URLs have no version, so those are
 * unpinned. Unknown hosts (github release pages, easemob, etc.) and a missing
 * URL return null, which the UI renders as a download-only product.
 */
export function deriveInstallCommand(
  version: SdkDownloadVersion,
): InstallCommand | null {
  const raw = version.packageManager;
  if (!raw) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const segments = url.pathname.split('/').filter(Boolean);

  switch (url.hostname) {
    case 'central.sonatype.com':
    case 'search.maven.org': {
      // /artifact/<group>/<artifact>/<version>/...
      if (segments[0] === 'artifact' && segments.length >= 4) {
        const [, group, artifact, mavenVersion] = segments;
        return {
          tool: 'Gradle',
          command: `implementation '${group}:${artifact}:${mavenVersion}'`,
        };
      }
      return null;
    }
    case 'pub.dev': {
      // /packages/<name>[/versions/<version>]
      if (segments[0] === 'packages' && segments[1]) {
        const name = segments[1];
        const pinned =
          segments[2] === 'versions' && segments[3] ? `:${segments[3]}` : '';
        return { tool: 'Flutter', command: `flutter pub add ${name}${pinned}` };
      }
      return null;
    }
    case 'unpkg.com': {
      // /<name>@<version>/...
      const spec = segments[0];
      return spec ? { tool: 'npm', command: `npm i ${spec}` } : null;
    }
    case 'www.npmjs.com': {
      // /package/<name> or /package/@scope/name, optionally followed by /v/<version>
      if (segments[0] !== 'package' || !segments[1]) {
        return null;
      }
      const scoped = segments[1].startsWith('@');
      if (scoped && !segments[2]) {
        return null;
      }
      const name = scoped ? `${segments[1]}/${segments[2]}` : segments[1];
      const versionIndex = scoped ? 3 : 2;
      const pinned =
        segments[versionIndex] === 'v' && segments[versionIndex + 1]
          ? `@${segments[versionIndex + 1]}`
          : '';
      return { tool: 'npm', command: `npm i ${name}${pinned}` };
    }
    case 'swiftpackageindex.com': {
      // /<owner>/<repo>
      if (segments.length >= 2) {
        return {
          tool: 'Swift Package Manager',
          command: `https://github.com/${segments[0]}/${segments[1]}`,
        };
      }
      return null;
    }
    case 'pypi.org': {
      // /project/<name>/
      if (segments[0] === 'project' && segments[1]) {
        return { tool: 'pip', command: `pip install ${segments[1]}` };
      }
      return null;
    }
    default:
      return null;
  }
}
