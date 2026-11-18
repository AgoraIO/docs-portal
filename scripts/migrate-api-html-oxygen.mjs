#!/usr/bin/env bun

import { runGeneratorCli } from './lib/api-center/generator-runner.mjs';

try {
  await runGeneratorCli('oxygen');
} catch (error) {
  console.error(`migrate-api-html-oxygen: ${error.message}`);
  process.exitCode = 1;
}

