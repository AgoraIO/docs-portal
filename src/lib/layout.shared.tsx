import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, portalGitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
    },
    githubUrl: `https://github.com/${portalGitConfig.user}/${portalGitConfig.repo}`,
  };
}
