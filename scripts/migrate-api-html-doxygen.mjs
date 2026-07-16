#!/usr/bin/env bun

import { runGeneratorCli } from './lib/api-center/generator-runner.mjs';

try {
  await runGeneratorCli('doxygen');
} catch (error) {
  console.error(`migrate-api-html-doxygen: ${error.message}`);
  process.exitCode = 1;
}

