#!/usr/bin/env bun

import { runGeneratorCli } from './lib/api-center/generator-runner.mjs';

try {
  await runGeneratorCli('appledoc');
} catch (error) {
  console.error(`migrate-api-html-appledoc: ${error.message}`);
  process.exitCode = 1;
}

