#!/usr/bin/env bun

import { runGeneratorCli } from './lib/api-center/generator-runner.mjs';

try {
  await runGeneratorCli('typedoc');
} catch (error) {
  console.error(`migrate-api-html-typedoc: ${error.message}`);
  process.exitCode = 1;
}

