# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues in `AgoraIO/docs-portal`. Use the `gh` CLI for all operations.

External pull requests are **not** a triage surface: `/triage` processes issues only. PRs are handled through the normal review workflow, not pulled into the issue queue.

## Conventions

- Create an issue: `gh issue create --title "..." --body "..."`
- Read an issue: `gh issue view <number> --comments`
- List issues: `gh issue list --state open --json number,title,body,labels,comments`
- Comment on an issue: `gh issue comment <number> --body "..."`
- Apply or remove labels: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- Close an issue: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v`; `gh` does this automatically when run inside this clone.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.
