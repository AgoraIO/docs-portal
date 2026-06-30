import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const docsRoot = path.join(root, 'content/docs/en');
const reportDir = path.join(root, 'docs/agents/reports');
const reportPath = path.join(reportDir, 'english-doc-low-errors.json');

const allowedChineseFiles = new Set([
  // These pages intentionally demonstrate multilingual message payloads.
  'content/docs/en/realtime-media/rtm/build/send-and-receive-messages/message-payload-structuring.mdx',
  'content/docs/en/realtime-media/speech-to-text/build/process-transcription-data/parse-data.mdx',
]);

const allowedChinesePatterns = [
  /https?:\/\/\S*[\p{Script=Han}]\S*/u,
  /doc-cms\/uploads\/\S*[\p{Script=Han}]\S*/u,
  /\bzh\b.*[\p{Script=Han}]/u,
  /"text"\s*:\s*"[\p{Script=Han}]/u,
  /new RoomContent\(TokenRole\.Admin,\s*"房间的 UUID"\)/u,
];

const properRepeatedWords = new Set([
  'had',
  'that',
]);

const knownWordFixes = [
  {
    pattern: /\bthe the\b/i,
    issueType: 'repeated word',
    rationale: 'The article is duplicated.',
    replacement: 'the',
  },
  {
    pattern: /\bconst const\b/,
    issueType: 'repeated keyword',
    rationale: 'The C++ declaration repeats the `const` keyword and would not compile as written.',
    replacement: 'const',
  },
  {
    pattern: /\bplugin plug-in\b/i,
    issueType: 'duplicated term',
    rationale: 'Two variants of the same noun appear back to back.',
    replacement: 'plug-in',
  },
  {
    pattern: /\bcallback callback\b/i,
    issueType: 'repeated word',
    rationale: 'The same noun is duplicated in sequence.',
    replacement: 'callback',
  },
  {
    pattern: /\bevent event\b/i,
    issueType: 'repeated word',
    rationale: 'The same noun is duplicated in sequence.',
    replacement: 'event',
  },
];

const wrongWordFixes = [
  {
    pattern: /\band displays the location\b/,
    issueType: 'wrong verb form',
    rationale: 'The coordinated verbs should agree with the subject `you`: `extract` and `display`.',
    replacement: 'and display the location',
  },
  {
    pattern: /\bpost sender-side processing\b/i,
    issueType: 'wrong compound phrase',
    rationale: '`post sender-side processing` is an awkward compound where the intended meaning is after sender-side processing.',
    replacement: 'after sender-side processing',
  },
];

const suspiciousWordFixes = [
  {
    pattern: /\bJavascript\b/g,
    issueType: 'wrong product term',
    rationale: 'The standard product/language spelling is `JavaScript`.',
    replacement: 'JavaScript',
  },
  {
    pattern: /\bTypescript\b/g,
    issueType: 'wrong product term',
    rationale: 'The standard product/language spelling is `TypeScript`.',
    replacement: 'TypeScript',
  },
  {
    pattern: /\bwebassembly\b/g,
    issueType: 'wrong product term',
    rationale: 'The standard technology name is `WebAssembly`.',
    replacement: 'WebAssembly',
  },
  {
    pattern: /\bThs\b/g,
    issueType: 'misspelling',
    rationale: '`Ths` is a misspelling of `The`.',
    replacement: 'The',
  },
  {
    pattern: /\baccumulative\b/i,
    issueType: 'wrong word',
    rationale: '`Cumulative` is the expected adjective for fees that add up over time.',
    replacement: 'cumulative',
  },
  {
    pattern: /\byou app\b/i,
    issueType: 'wrong word',
    rationale: 'The possessive determiner should be `your` before `app`.',
    replacement: 'your app',
  },
  {
    pattern: /\bFor example\. in\b/i,
    issueType: 'punctuation error',
    rationale: '`For example` should be followed by a comma, not a sentence break before a lowercase continuation.',
    replacement: 'For example, in',
  },
  {
    pattern: /\bcompetitions users\b/i,
    issueType: 'missing comma',
    rationale: 'The introductory phrase ends before `users`; a comma is needed to avoid running the words together.',
    replacement: 'competitions, users',
  },
  {
    pattern: /\bextensions is used\b/i,
    issueType: 'subject-verb agreement',
    rationale: 'The plural subject `extensions` needs the plural verb `are`.',
    replacement: 'extensions are used',
  },
  {
    pattern: /\bidentifiers a user\b/i,
    issueType: 'wrong verb form',
    rationale: '`Identifiers` is a noun; the sentence needs the verb `identifies`.',
    replacement: 'identifies a user',
  },
  {
    pattern: /\bTo join a On-Premise\b/,
    issueType: 'article error',
    rationale: '`On-Premise` starts with a vowel sound, so the article should be `an`.',
    replacement: 'To join an On-Premise',
  },
  {
    pattern: /\bcreate a stream for a user and gives\b/i,
    issueType: 'wrong verb form',
    rationale: 'The coordinated verbs should agree: `create` and `give`.',
    replacement: 'create a stream for a user and give',
  },
  {
    pattern: /\bspecifed\b/i,
    issueType: 'misspelling',
    rationale: '`Specifed` is a misspelling of `specified`.',
    replacement: 'specified',
  },
  {
    pattern: /\bremove them from list\b/i,
    issueType: 'missing article',
    rationale: 'The noun `list` needs the article `the` in this phrase.',
    replacement: 'remove them from the list',
  },
  {
    pattern: /\bmessages history\b/i,
    issueType: 'wrong noun form',
    rationale: '`Message history` is the expected compound noun.',
    replacement: 'message history',
  },
  {
    pattern: /\bup to of\b/i,
    issueType: 'duplicated preposition',
    rationale: '`Up to of` repeats two incompatible prepositions.',
    replacement: 'up to',
  },
  {
    pattern: /Users log in automatically \(TODO\)\./,
    issueType: 'placeholder residue',
    rationale: '`TODO` is an unresolved authoring placeholder; the parallel metrics page describes automatic login as using a persistent token.',
    replacement: 'Users log in automatically through a persistent token.',
  },
];

const generatedResidueFixes = [
  {
    pattern: /`BLUETOOTH_CONNECT`permission/g,
    issueType: 'missing space',
    rationale: 'The permission noun is joined directly to the inline code span.',
    replacement: '`BLUETOOTH_CONNECT` permission',
  },
  {
    pattern: /CHAT_ONE\.toLowerCase\(\)s/g,
    issueType: 'generated placeholder residue',
    rationale: 'A source expression leaked into rendered prose.',
    replacement: 'one-to-one chats',
  },
  {
    pattern: /CHAT_GROUP\.toLowerCase\(\)s/g,
    issueType: 'generated placeholder residue',
    rationale: 'A source expression leaked into rendered prose.',
    replacement: 'group chats',
  },
  {
    pattern: /CHAT_ROOM\.toLowerCase\(\)s/g,
    issueType: 'generated placeholder residue',
    rationale: 'A source expression leaked into rendered prose.',
    replacement: 'chat rooms',
  },
  {
    pattern: /CHAT_ROOM\.toLowerCase\(\)/g,
    issueType: 'generated placeholder residue',
    rationale: 'A source expression leaked into rendered prose.',
    replacement: 'chat room',
  },
  {
    pattern: /CHAT_GROUP\.toLowerCase\(\)/g,
    issueType: 'generated placeholder residue',
    rationale: 'A source expression leaked into rendered prose.',
    replacement: 'group chat',
  },
  {
    pattern: /CHAT_ONE\.toLowerCase\(\)/g,
    issueType: 'generated placeholder residue',
    rationale: 'A source expression leaked into rendered prose.',
    replacement: 'one-to-one chat',
  },
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function stripInlineNoise(line) {
  return line
    .replace(/`[^`]*`/g, '`CODE`')
    .replace(/https?:\/\/\S+/g, 'URL')
    .replace(/\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/<[^>\n]*https?:\/\/[^>\n]*>/g, 'TAG');
}

function isMdxTagOnly(line) {
  const trimmed = line.trim();
  return /^<\/?[A-Z][A-Za-z0-9]*(\s|>|\/>)/.test(trimmed) || /^<\/?[a-z][A-Za-z0-9-]*(\s|>|\/>)/.test(trimmed);
}

function isLikelyTableSeparator(line) {
  return /^\s*\|?[\s:|-]+\|[\s:|-|]+\s*$/.test(line);
}

function isListMarkerOnly(line) {
  return /^\s*(?:[-*+]|\d+\.)\s*$/.test(line);
}

function isStructuralLine(line) {
  const trimmed = line.trim();
  return (
    trimmed === '' ||
    trimmed === '---' ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('import ') ||
    trimmed.startsWith('export ') ||
    trimmed.startsWith(':::') ||
    trimmed.startsWith('<!--') ||
    trimmed === '-->' ||
    isLikelyTableSeparator(line) ||
    isMdxTagOnly(line)
  );
}

function isIndentedCodeLike(line, prevLine) {
  if (!/^\s{4,}\S/.test(line)) {
    return false;
  }
  const trimmed = line.trim();
  if (/^(?:[-*+]|\d+\.)\s+/.test(trimmed)) {
    return false;
  }
  if (/^(?:\/\/|\/\*|\*|#|<|>|}|{|;|\)|\]|const |let |var |if |else\b|for |while |return\b|public |private |class |func |def |import |using |typedef |virtual |static |new |Debug\.|console\.|UE_LOG|Payload\b|[A-Za-z_][\w.]*\s*[=:({])/i.test(trimmed)) {
    return true;
  }
  return prevLine != null && /^\s*```/.test(prevLine);
}

function isCommandOutputContext(lines, index) {
  const prev = lines[index - 1]?.trim() ?? '';
  const current = lines[index].trim();
  return (
    /output similar to:?$/i.test(prev) ||
    /looks like this:?$/i.test(prev) ||
    /following output:?$/i.test(prev) ||
    /^\$ /.test(current) ||
    /^[A-Z_]+=.*/.test(current)
  );
}

function nextVisibleLine(lines, index) {
  for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
    const candidate = lines[cursor].trim();
    if (candidate !== '') {
      return { line: lines[cursor], index: cursor };
    }
  }
  return null;
}

function addFinding(findings, finding) {
  findings.push({
    severity: finding.severity ?? 'medium',
    file: finding.file,
    line: finding.line,
    snippet: finding.snippet.trim(),
    issueType: finding.issueType,
    rationale: finding.rationale,
    suggestion: finding.suggestion,
  });
}

function scanFile(filePath) {
  const rel = path.relative(root, filePath);
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const findings = [];
  let inFence = false;
  let inFrontmatter = lines[0]?.trim() === '---';
  let inHtmlComment = false;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    if (index > 0 && inFrontmatter && trimmed === '---') {
      inFrontmatter = false;
      return;
    }
    if (inFrontmatter) {
      return;
    }

    if (/^\s*```/.test(line) || /^\s*~~~/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) {
      return;
    }

    if (trimmed.startsWith('<!--')) {
      inHtmlComment = !trimmed.includes('-->');
      return;
    }
    if (inHtmlComment) {
      if (trimmed.includes('-->')) {
        inHtmlComment = false;
      }
      return;
    }

    const prevLine = lines[index - 1] ?? '';
    const nextLine = lines[index + 1] ?? '';
    const cleaned = stripInlineNoise(line);

    for (const fix of knownWordFixes) {
      if (fix.pattern.test(cleaned)) {
        const suggestion = line.replace(fix.pattern, fix.replacement);
        addFinding(findings, {
          severity: 'high',
          file: rel,
          line: lineNumber,
          snippet: line,
          issueType: fix.issueType,
          rationale: fix.rationale,
          suggestion,
        });
      }
    }

    for (const fix of wrongWordFixes) {
      if (!isIndentedCodeLike(line, prevLine) && fix.pattern.test(cleaned)) {
        const suggestion = line.replace(fix.pattern, fix.replacement);
        addFinding(findings, {
          severity: 'high',
          file: rel,
          line: lineNumber,
          snippet: line,
          issueType: fix.issueType,
          rationale: fix.rationale,
          suggestion,
        });
      }
    }

    for (const fix of suspiciousWordFixes) {
      fix.pattern.lastIndex = 0;
      if (!isIndentedCodeLike(line, prevLine) && fix.pattern.test(cleaned)) {
        const suggestion = line.replace(fix.pattern, fix.replacement);
        addFinding(findings, {
          severity: 'high',
          file: rel,
          line: lineNumber,
          snippet: line,
          issueType: fix.issueType,
          rationale: fix.rationale,
          suggestion,
        });
      }
    }

    for (const fix of generatedResidueFixes) {
      fix.pattern.lastIndex = 0;
      if (!isIndentedCodeLike(line, prevLine) && fix.pattern.test(line)) {
        const suggestion = line.replace(fix.pattern, fix.replacement).replace(/\s+\|/g, ' |');
        addFinding(findings, {
          severity: 'high',
          file: rel,
          line: lineNumber,
          snippet: line,
          issueType: fix.issueType,
          rationale: fix.rationale,
          suggestion,
        });
      }
    }

    const repeated = cleaned.match(/\b([A-Za-z]{2,})\s+\1\b/i);
    if (repeated) {
      const word = repeated[1].toLowerCase();
      if (
        !properRepeatedWords.has(word) &&
        !/\b(in)\s+in-(?:ear|app|browser|call|person)\b/i.test(cleaned) &&
        !/\b(?:in|on|to|for|as|with|by|at|from)\s+(?:in|on|to|for|as|with|by|at|from)\b/i.test(cleaned)
      ) {
        addFinding(findings, {
          severity: 'high',
          file: rel,
          line: lineNumber,
          snippet: line,
          issueType: 'repeated word',
          rationale: `The word \`${repeated[1]}\` appears twice in a row.`,
          suggestion: line.replace(new RegExp(`\\b(${repeated[1]})\\s+${repeated[1]}\\b`, 'i'), '$1'),
        });
      }
    }

    if (isListMarkerOnly(line) && !isIndentedCodeLike(line, prevLine)) {
      const nearbyLooksLikeCode = [prevLine, nextLine].some((nearby) => {
        const t = nearby.trim();
        return /^(?:\/\*|\*\/|\* @|\/\/|[A-Za-z_][\w.]*\s*[=:({]|}|<\w+)/.test(t);
      });
      if (!nearbyLooksLikeCode) {
        addFinding(findings, {
          severity: 'high',
          file: rel,
          line: lineNumber,
          snippet: line,
          issueType: 'broken list item',
          rationale: 'The list marker has no item text or nested content attached to it.',
          suggestion: 'Remove the empty marker or add the missing list item text.',
        });
      }
    }

    if (!isStructuralLine(line) && /:\s*$/.test(cleaned) && !isCommandOutputContext(lines, index)) {
      const nextVisible = nextVisibleLine(lines, index);
      const nextTrimmed = nextVisible?.line.trim() ?? '';
      const hasContentNext =
        nextTrimmed !== '' &&
        (/^(?:[-*+]|\d+\.)\s+\S/.test(nextTrimmed) ||
          /^```/.test(nextTrimmed) ||
          /^:::/.test(nextTrimmed) ||
          /^<\/?[A-Z]/.test(nextTrimmed) ||
          /^!\[/.test(nextTrimmed) ||
          /^\|/.test(nextTrimmed));
      if (!hasContentNext && nextVisible == null) {
        addFinding(findings, {
          severity: 'medium',
          file: rel,
          line: lineNumber,
          snippet: line,
          issueType: 'empty colon lead-in',
          rationale: 'The sentence ends with a colon but is not followed by visible content.',
          suggestion: 'Add the missing content after the colon, or replace the colon with terminal punctuation.',
        });
      }
    }

    if (!allowedChineseFiles.has(rel) && /[\p{Script=Han}]/u.test(line)) {
      const isAllowed = allowedChinesePatterns.some((pattern) => pattern.test(line));
      if (!isAllowed) {
        addFinding(findings, {
          severity: 'high',
          file: rel,
          line: lineNumber,
          snippet: line,
          issueType: 'Chinese text in English doc',
          rationale: 'The English documentation contains Chinese characters outside an allowed multilingual sample, URL, or preserved proper noun context.',
          suggestion: 'Translate the Chinese text to English, or move it into an explicitly multilingual code sample if intentional.',
        });
      }
    }

    if (!isStructuralLine(line) && !isIndentedCodeLike(line, prevLine) && !/[.!?):\]}`]$/.test(trimmed)) {
      const startsLikeSentence = /^(?:The|This|These|Those|You|If|When|After|Before|For|To|Use|Run|Create|Configure|Set|Call|Click|Open|Select|Ensure|Make|Add|Copy|Paste|Download|Install|Enable|Disable|Start|Stop|Join|Leave|Send|Receive|Get|Update|Delete)\b/.test(trimmed);
      const nextIsBlankOrHeading = nextLine.trim() === '' || /^#{1,6}\s/.test(nextLine.trim());
      const obviousFragment = /(?:\.\s+[A-Z]\s*$|\b(?:and|or|to|with|for|from|by|of|the|a|an|is|are|was|were|be|been|being|can|could|should|will|would|may|might|must)\s*$)/.test(trimmed);
      if (startsLikeSentence && nextIsBlankOrHeading && obviousFragment) {
        addFinding(findings, {
          severity: 'medium',
          file: rel,
          line: lineNumber,
          snippet: line,
          issueType: 'possibly unfinished sentence',
          rationale: 'The line starts like prose but has no terminal punctuation before a boundary.',
          suggestion: 'Complete the sentence or add the missing terminal punctuation.',
        });
      }
    }
  });

  return findings;
}

const findings = walk(docsRoot)
  .sort()
  .flatMap(scanFile)
  .sort((a, b) => {
    const severityRank = { high: 0, medium: 1, low: 2 };
    return (
      severityRank[a.severity] - severityRank[b.severity] ||
      a.file.localeCompare(b.file) ||
      a.line - b.line
    );
  });

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(
  reportPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      scope: 'content/docs/en/**/*.md{x}',
      findingCount: findings.length,
      findings,
    },
    null,
    2,
  )}\n`,
);

if (process.argv.includes('--markdown')) {
  for (const finding of findings) {
    console.log(`- ${finding.severity.toUpperCase()} ${finding.file}:${finding.line}`);
    console.log(`  - Original: ${finding.snippet}`);
    console.log(`  - Type: ${finding.issueType}`);
    console.log(`  - Why: ${finding.rationale}`);
    console.log(`  - Suggestion: ${finding.suggestion}`);
  }
} else {
  console.log(`English low-error findings: ${findings.length}`);
  console.log(`Report: ${path.relative(root, reportPath)}`);
}

process.exitCode = findings.length > 0 ? 1 : 0;
