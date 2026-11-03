import fs from 'node:fs';
import path from 'node:path';

export function summarizeReport(records, gaps, coverage) {
  const counts = { valid: 0, broken: 0, unverified: 0, 'not-applicable': 0 };
  for (const record of records)
    counts[record.status in counts ? record.status : 'unverified']++;
  const complete =
    coverage.expectedPages > 0 &&
    coverage.checkedPages === coverage.expectedPages &&
    gaps.length === 0 &&
    counts.unverified === 0;
  return {
    status: counts.broken > 0 ? 'FAIL' : complete ? 'PASS' : 'INCOMPLETE',
    ...counts,
    gaps: gaps.length,
    occurrences: records.length,
    uniqueTargets: new Set(
      records.map((record) => record.target).filter(Boolean),
    ).size,
  };
}

const cell = (value) =>
  String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .replace(/`/g, "'");
export function formatMarkdown(report) {
  const lines = [
    '# 中文文档链接检查',
    '',
    `- 结果：**${report.summary.status}**`,
    `- 模式：${report.mode}`,
    `- HTML 匹配：${report.match ?? 'artifact'}`,
    `- 提交：${report.commit}`,
    `- 检查时间：${report.checkedAt}`,
    '',
    '## 汇总',
    '',
    '| 项目 | 数量 |',
    '| --- | --- |',
  ];
  for (const [key, value] of Object.entries({
    ...report.coverage,
    ...report.summary,
  }))
    lines.push(`| ${cell(key)} | ${cell(value)} |`);
  lines.push(
    '',
    'PASS 只表示本次模式的检查完成。静态或构建检查不能证明公网可达；INCOMPLETE 与待核查链接不能计为成功。',
    '',
    '## 问题（按目标和原因归并）',
    '',
  );
  const groups = new Map();
  for (const record of report.records.filter(
    (row) => !['valid', 'not-applicable'].includes(row.status),
  )) {
    const key = `${record.status}\0${record.target ?? record.href}\0${record.reason}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  for (const rows of [...groups.values()].slice(0, 100)) {
    const first = rows[0];
    lines.push(
      `### ${cell(first.status)}: ${cell(first.target ?? first.href)}`,
      '',
      `原因：${cell(first.reason)}；引用次数：${rows.length}`,
      '',
      '| 来源 | 页面/状态 | 原始链接 |',
      '| --- | --- | --- |',
    );
    for (const row of rows.slice(0, 20))
      lines.push(
        `| ${cell(row.sourcePath)}${row.line ? `:${row.line}` : ''}${row.pointer ? ` (${cell(row.pointer)})` : ''} | ${cell(row.pageUrl)} ${cell(row.platform ?? row.state)} | ${cell(row.href)} |`,
      );
    lines.push('');
  }
  if (
    groups.size > 100 ||
    [...groups.values()].some((rows) => rows.length > 20)
  )
    lines.push(
      'Markdown 展示前 100 组、每组前 20 个来源；全部引用和证据见 report.json / links.csv，未展示项没有被跳过检查。',
      '',
    );
  if (groups.size === 0) lines.push('未发现链接问题。', '');
  lines.push('## 覆盖缺口', '');
  if (report.gaps.length === 0) lines.push('无。');
  else
    for (const gap of report.gaps.slice(0, 100))
      lines.push(
        `- ${cell(gap.sourcePath ?? gap.pageUrl)}${gap.line ? `:${gap.line}` : ''}：${cell(gap.reason)} ${cell(gap.detail)}`,
      );
  if (report.gaps.length > 100)
    lines.push(
      `另有 ${report.gaps.length - 100} 项覆盖缺口，完整清单见 report.json。`,
    );
  return `${lines.join('\n')}\n`;
}

export function formatCsv(report) {
  const columns = [
    'status',
    'reason',
    'sourcePath',
    'line',
    'column',
    'pageUrl',
    'platform',
    'state',
    'pointer',
    'href',
    'target',
    'httpStatus',
    'finalUrl',
    'checkedAt',
  ];
  const quote = (value) => {
    let text = String(value ?? '');
    if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  return `${[columns, ...report.records.map((row) => columns.map((key) => row[key]))].map((row) => row.map(quote).join(',')).join('\n')}\n`;
}

export function writeReport(report, directory) {
  fs.mkdirSync(directory, { recursive: true });
  const json = fs.openSync(path.join(directory, 'report.json'), 'w');
  const csv = fs.openSync(path.join(directory, 'links.csv'), 'w');
  try {
    const metadata = JSON.stringify({ ...report, records: undefined }, null, 2);
    fs.writeSync(json, `${metadata.slice(0, -1)},\n  "records": [\n`);
    fs.writeSync(csv, formatCsv({ records: [] }));
    for (let offset = 0; offset < report.records.length; offset += 1000) {
      const batch = report.records.slice(offset, offset + 1000);
      fs.writeSync(
        json,
        `${offset ? ',\n' : ''}${batch.map((row) => JSON.stringify(row)).join(',\n')}`,
      );
      const chunk = formatCsv({ records: batch });
      fs.writeSync(csv, chunk.slice(chunk.indexOf('\n') + 1));
    }
    fs.writeSync(json, '\n  ]\n}\n');
  } finally {
    fs.closeSync(json);
    fs.closeSync(csv);
  }
  fs.writeFileSync(path.join(directory, 'report.md'), formatMarkdown(report));
}
