# English page feedback analytics

The English site uses the same inline Yes/No feedback interaction as the Chinese site. These events go to the global site's configured PostHog project through `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST`. The Chinese measurement flag is not required for English feedback.

## Events and triggers

| Event | Trigger | Additional properties |
| --- | --- | --- |
| `docs_feedback_prompted` | The feedback block becomes visible in the viewport, once per mounted page. Hidden tabs and content covered by a modal do not count. | `question_id=page_helpfulness` |
| `docs_page_feedback` | The visitor selects Yes or No, or switches their vote. Collapsing or reopening the same vote does not emit another vote. | `question_id=page_helpfulness`, `value=yes\|no`, `evidence_source=self_report` |
| `docs_feedback_opened` | A vote expands the follow-up form, including reopening a draft, switching branches, or starting new feedback after submission. Collapsing does not emit this event. | `question_id=reasons`, `value=yes\|no` |
| `docs_feedback_form_submitted` | A nonempty optional reason/comment submission is accepted by the PostHog SDK. | `question_id=reasons`, `feedback_id`, `value`, `response`, `comment`, `has_comment`, `feedback_destination=analytics` |
| `docs_feedback_issue_clicked` | The visitor clicks **Create a GitHub issue** after a successful submission. | `question_id=reasons`, `feedback_id`, `value`, `feedback_destination=github` |

All five events include `locale=en`, `deployment_region=global`, `canonical_path`, `feedback_scope=page`, `feedback_source=manual`, `surface=content`, and `prompt_version=inline-reasons-v2`. `canonical_path` excludes query strings and fragments. Existing English vote fields and structured page context remain available. This flow does not start or reuse the Chinese journey questionnaire.

All five events also carry `environment` and `app_release`: the explicit `VITE_DOCS_ENVIRONMENT`/`VITE_DOCS_APP_RELEASE` values take precedence, with the global production build's `VITE_DEPLOY_ENVIRONMENT`/`VITE_DEPLOY_VERSION` used as fallbacks. A production submission is always marked as visitor traffic even if a local QA session marker is present.

`response` contains language-independent reason codes, so English and Chinese labels do not split reason statistics. See [the shared feedback contract](feedback-form-v1.md) for the reason enums and submission rules.

## Correlation and interpretation

- Join a GitHub follow-up click to its detailed submission using `feedback_id`. Both use the immutable submitted snapshot, even when the form is later reopened or another vote is selected.
- A click means the GitHub issue creation page was opened. It does not mean an issue was created. The destination URL, prefilled issue body, and page title are not attached to the explicit click event.
- Only detailed submissions carry the visitor's explicitly submitted comment, trimmed to 2,000 characters with line breaks preserved. Opening, voting, and GitHub click handlers do not include draft comments.
- Failed submissions keep their draft. Unchanged retries reuse the same UUID; deduplicate detailed submission transport copies by `feedback_id`. A new submission gets a new ID. A GitHub click does not submit the feedback again.
- SDK acceptance is not confirmation that an event has reached the PostHog query store. No production ingestion claim is made by component/SDK tests.
- Local development disables PostHog. The success state and GitHub follow-up therefore require a configured deployed build or a controlled test; a local failure must not be presented as successful collection.

## Inspect the events in PostHog

```sql
SELECT
  timestamp,
  event,
  properties.canonical_path AS page_path,
  properties.value AS helpfulness,
  properties.feedback_id AS feedback_id,
  properties.response AS reasons,
  properties.comment AS comment
FROM events
WHERE properties.locale = 'en'
  AND properties.deployment_region = 'global'
  AND properties.prompt_version = 'inline-reasons-v2'
  AND event IN (
    'docs_feedback_prompted',
    'docs_page_feedback',
    'docs_feedback_opened',
    'docs_feedback_form_submitted',
    'docs_feedback_issue_clicked'
  )
ORDER BY timestamp DESC
LIMIT 100
```

Component tests verify viewport exposure, voting/reopening behavior, and the GitHub link handler. SDK integration tests verify both positive and negative flows, global project configuration, locale/path metadata, reason codes, comment filtering, and the submission-to-click ID association. Chinese collection retains its existing measurement path.
