import { realpathSync } from 'node:fs';
import { mergeConfig } from 'vite';
import config from '../../vite.config';

// Local worktrees can share a symlinked node_modules directory.
export default mergeConfig(config, {
  server: { fs: { allow: [process.cwd(), realpathSync('node_modules')] } },
});
