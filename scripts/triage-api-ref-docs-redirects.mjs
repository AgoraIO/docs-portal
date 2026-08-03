/**
 * @typedef {object} ApiRefDocsLinkOccurrence
 * @property {string} anchorText
 * @property {string} entry
 * @property {string} group
 * @property {string} rawHref
 * @property {string} sourceApiReferencePage
 */

/**
 * @typedef {object} ApiRefDocsUniqueUrl
 * @property {string} finalUrl
 * @property {string} httpStatus
 * @property {string} legacyRedirect
 * @property {number} number
 * @property {ApiRefDocsLinkOccurrence[]} occurrences
 * @property {string} path
 * @property {string} query
 * @property {string} url
 */

/**
 * @typedef {object} ApiRefDocsPageError
 * @property {string} entry
 * @property {string} group
 * @property {string} message
 * @property {string} sourceApiReferencePage
 * @property {string} status
 */

/**
 * @typedef {object} ApiRefDocsLinksReport
 * @property {ApiRefDocsPageError[]} pageErrors
 * @property {ApiRefDocsUniqueUrl[]} uniqueUrls
 */

/**
 * @typedef {object} ApiRefDocsTriageClassification
 * @property {string} confidence
 * @property {string} decision
 * @property {string} proposedTarget
 */

/**
 * @typedef {object} RenderTriageMarkdownOptions
 * @property {string} [generatedAt]
 * @property {string} [sourceReportPath]
 */

/**
 * @param {string} _markdown
 * @returns {ApiRefDocsLinksReport}
 */
export function parseApiRefDocsLinksReport(_markdown = '') {
  return { pageErrors: [], uniqueUrls: [] };
}

/**
 * @param {{ httpStatus?: string, legacyRedirect?: string }} _entry
 * @returns {ApiRefDocsTriageClassification}
 */
export function classifyAuditEntry(_entry = {}) {
  return { confidence: 'n/a', decision: 'ignore-valid', proposedTarget: '' };
}

/**
 * @param {ApiRefDocsLinksReport} _parsed
 * @param {RenderTriageMarkdownOptions} [_options]
 * @returns {string}
 */
export function renderTriageMarkdown(_parsed, _options = {}) {
  return '';
}
