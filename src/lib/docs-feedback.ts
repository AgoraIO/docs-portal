export const negativeFeedbackReasons = {
  not_found: '找不到所需内容',
  wrong_context: '产品、平台或版本不匹配',
  incorrect_or_outdated: '内容错误或过时',
  unclear: '内容难以理解',
  steps_failed: '步骤或代码无法运行',
  other: '其他',
};
export const positiveFeedbackReasons = {
  clear: '内容清晰易懂',
  useful_examples: '示例实用',
  solved_problem: '解决了我的问题',
  easy_to_find: '容易找到所需信息',
  other: '其他',
};

export type DocsFeedbackSubmission = Readonly<{
  id: string;
  submittedAt: string;
  helpfulness: 'yes' | 'no';
  reasons: readonly string[];
  details: string;
  pageUrl: string;
  pageTitle: string;
}>;

export function prepareDocsFeedback(
  input: Omit<DocsFeedbackSubmission, 'reasons'> & {
    reasons: readonly string[];
  },
): DocsFeedbackSubmission | null {
  const labels =
    input.helpfulness === 'yes'
      ? positiveFeedbackReasons
      : negativeFeedbackReasons;
  const keys = Object.keys(labels);
  if (input.reasons.some((reason) => !keys.includes(reason))) return null;
  const details =
    input.helpfulness === 'no' ? input.details.trim().slice(0, 2000) : '';
  const reasons = keys.filter((reason) => input.reasons.includes(reason));
  if (!reasons.length && details) reasons.push('other');
  if (!reasons.length) return null;
  const page = new URL(input.pageUrl);
  return Object.freeze({
    ...input,
    details,
    reasons: Object.freeze(reasons),
    pageUrl: `${page.origin}${page.pathname}`,
  });
}

export function feedbackReasonLabel(helpfulness: 'yes' | 'no', reason: string) {
  const labels: Record<string, string> =
    helpfulness === 'yes' ? positiveFeedbackReasons : negativeFeedbackReasons;
  return labels[reason] ?? reason;
}

export function buildFeedbackIssueUrl(submission: DocsFeedbackSubmission) {
  const url = new URL('https://github.com/AgoraIO/docs-portal/issues/new');
  url.searchParams.set(
    'title',
    `文档反馈：${submission.pageTitle || '文档页面'}`,
  );
  url.searchParams.set(
    'body',
    [
      `页面：${submission.pageUrl}`,
      `页面标题：${submission.pageTitle || '文档页面'}`,
      `是否有帮助：${submission.helpfulness === 'yes' ? '有' : '没有'}`,
      `原因：${submission.reasons.map((reason) => feedbackReasonLabel(submission.helpfulness, reason)).join('；')}`,
      '',
      '补充说明：',
      submission.details,
      '',
      `反馈编号：${submission.id}`,
    ].join('\n'),
  );
  return url.toString();
}
