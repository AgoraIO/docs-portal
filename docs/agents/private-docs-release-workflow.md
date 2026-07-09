# Private documentation release workflow

`AgoraIO/docs-portal` is the source of truth for site code and published content.
A separate private mirror repository keeps the exact public `main` commit and
adds short-lived `releases/**` branches for unpublished documentation previews.

## Repository invariants

- Public `main` is the only editable main branch.
- Private `main` must resolve to the same commit as public `main`.
- Authors create `releases/**` branches from private `main` and do not edit
  private `main` directly.
- Private releases may change only `content/docs/**`.
- Publishing rebuilds a new public commit; private commits are never pushed or
  cherry-picked into the public repository.
- A repository is private-role only when its Actions variable
  `DOCS_PORTAL_REPO_ROLE` is exactly `private`. An unset variable is never
  interpreted as private, including in public forks.

## Private repository configuration

Create this Actions repository variable in the private mirror:

```text
DOCS_PORTAL_REPO_ROLE=private
```

Create an Actions environment named `private-docs-publish` and add the
environment secret `DOCS_PORTAL_PUBLIC_TOKEN`. The secret must be a fine-grained
personal access token selected for `AgoraIO/docs-portal` only, with:

- Contents: read and write
- Pull requests: read and write

Restrict the environment to the `main` branch and require a reviewer. This
keeps the public write token behind an explicit approval and prevents a release
branch from changing the workflow that receives it.

Do not add the public token as a repository-level secret. Synchronizing private
`main` uses the private repository's own `GITHUB_TOKEN`; it does not need the
fine-grained token.

## Private main ruleset

Create a ruleset for private `main` that:

- blocks branch deletion;
- restricts direct updates and force pushes for normal users;
- permits the GitHub Actions workflow actor to update and force-update `main`;
- does not require a pull request, because synchronization updates the ref
  directly.

The `Sync Private Main` workflow runs every day at 02:00 Asia/Shanghai and on
manual dispatch. It fetches public `main`, pushes it to the private `main` ref
with `--force-with-lease`, and verifies the remote SHA afterward. A concurrent
update causes the workflow to fail instead of overwriting an unobserved commit.

## Private Vercel project

Connect the private mirror repository to a separate Vercel project through the
Vercel Git Integration. Do not configure Vercel credentials in private GitHub
Actions.

Required project settings:

- Production Branch: `main`
- Deployment Protection: Vercel Authentication
- Production domains: none
- Ignored Build Step:

```bash
if [[ "$VERCEL_GIT_COMMIT_REF" == releases/* ]]; then
  exit 1
else
  exit 0
fi
```

For an Ignored Build Step, exit code `0` skips the build and exit code `1`
continues it. A private `main` synchronization is therefore ignored, while a
push to `releases/**` creates a protected Preview deployment.

The mirrored GitHub Actions Vercel workflow is guarded by the public repository
name, so it does not run deployment jobs in the private mirror or public forks.

## Activation order

Keep Actions disabled in the private mirror until this workflow exists on
public `main`. Then synchronize private `main` to that public commit once,
configure the role variable, token environment, ruleset, and Vercel project,
and enable Actions. This avoids running older mirrored workflows before their
repository guards exist.

## Author workflow

Create and update a release branch in the private mirror:

```bash
git switch main
git pull --ff-only
git switch -c releases/new-product
```

Pushes to that branch create internal Vercel previews. Before publishing, merge
or rebase the latest private `main`; the publication workflow rejects a source
branch that does not contain the latest public `main` commit.

To publish, open the private repository's Actions page and run `Publish Private
Release` with:

- `source_branch`: the private `releases/**` branch;
- `pr_title`: the title for the public pull request.

The workflow itself is loaded from private `main`. It validates the branch and
path allowlist, pins the source branch to its commit SHA, applies only the
`content/docs/**` patch to a clean public `main` checkout, creates
`publish/private-release-<sha>`, and opens a public pull request. It checks
public `main` again before pushing and asks the operator to retry if it advanced
during preparation. Delete the private release branch after the public pull
request merges.
