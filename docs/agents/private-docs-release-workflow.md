# Private documentation release workflow

`AgoraIO/docs-portal` is the source of truth for site code and published content.
A separate private mirror repository keeps the exact public `main` commit and
adds short-lived `releases/**` branches for unpublished documentation previews.

## Author workflow

Use the private mirror for documentation that is not ready to be public.
Previews build directly on Vercel; GitHub Actions and a local development setup
are not required.

### Get access

Ask the maintainers for:

- Write access to the private GitHub repository.
- Access to the Vercel team or project that hosts its protected previews.

Use the GitHub identity associated with your Vercel account when committing.
If Vercel rejects the commit author, ask the Vercel team administrator to check
that account's access and GitHub connection.

### Create a preview in GitHub

1. Open the private repository and select `main` in the branch selector.
2. Create a branch beginning with `releases/`, for example
   `releases/alex/new-guide`. Use your name and topic to keep branches distinct.
3. Edit the documentation under `content/docs/**` and commit to that branch.
   Follow the [Markdown authoring standard](markdown-authoring-standard.md).
4. Open a **Draft pull request** from your release branch to private `main`.
5. Wait for the **Vercel** check to succeed and the Vercel bot's deployment
   comment to show **Ready**. Open **Preview** in that comment and sign in to
   Vercel with an account that has access to the project.
6. Share the private PR or Preview link with reviewers who have the required
   access. Commit further edits to the same branch; Vercel rebuilds it and
   updates the PR's preview link.

Keep the private review PR unmerged. Private `main` is a mirror, not a place to
merge unpublished documentation. Ask the maintainer to publish the approved
content when it is ready for public release.

### Work locally instead

Copy the private repository's clone URL from **Code** in GitHub. Replace
`PRIVATE_REPOSITORY_URL` below with that URL, and choose your own release branch:

```bash
git clone PRIVATE_REPOSITORY_URL docs-private
cd docs-private
git switch -c releases/alex/new-guide

# Edit files under content/docs/, then commit and push.
git add content/docs
git commit -m "docs: update unpublished guide"
git push -u origin HEAD

gh pr create --draft --base main
```

For an existing checkout, switch to `main` and run `git pull --ff-only` before
creating a new release branch. The rest of the preview and review flow is the
same as in GitHub.

### Troubleshoot a preview

| Symptom | What to check |
| --- | --- |
| Deployment is skipped | The source branch must begin with `releases/`. `main` and ordinary feature branches are intentionally skipped. |
| Build fails | Open the Vercel check's deployment details and share the failing step with the maintainer. GitHub Actions is not the preview builder. |
| Preview requests a login or denies access | Sign in with the correct Vercel account. Ask the project maintainer to check access if it is still denied. |
| Preview shows an older edit | Wait for the latest commit's Vercel check to succeed, then open the Preview link in the PR's updated deployment comment. |

## Repository invariants

- Public `main` is the only editable main branch.
- Private `main` must resolve to the same commit as public `main`.
- Authors create `releases/**` branches from private `main` and do not edit
  private `main` directly.
- Private releases may change only `content/docs/**`.
- External images and attachments keep their own access permissions; protecting
  the preview site does not make a public asset URL private.
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

When GitHub Actions is enabled, the `Sync Private Main` workflow runs every day
at 02:00 Asia/Shanghai and on manual dispatch. It fetches public `main`, pushes
it to the private `main` ref with `--force-with-lease`, and verifies the remote
SHA afterward. A concurrent
update causes the workflow to fail instead of overwriting an unobserved commit.

## Private Vercel project

Connect the private mirror repository to a separate Vercel project through the
Vercel Git Integration. Do not configure Vercel credentials in private GitHub
Actions.

Required project settings:

- Production Branch: `main`
- Deployment Protection: Vercel Authentication
- Production domains: none
- Preview environment variable: `VITE_DEPLOY_ENVIRONMENT=preview`, so previews
  search their own bundled content instead of the production index.
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

For previews, synchronize private `main` to public `main` and configure the
Vercel project above. GitHub Actions can remain disabled: Vercel's Git
Integration builds release branches and posts the preview links.

Enable private GitHub Actions only when the synchronization or publication
automation is needed. First ensure the guarded workflows exist on public
`main`, synchronize the mirror, and configure the role variable, token
environment, and ruleset. Enabling Actions may consume the private repository
owner's Actions allowance.

## Publishing (maintainers)

Creating the public branch and PR exposes the selected documentation publicly,
before the PR is merged. Confirm that the content is ready to be public first.

The publication workflow requires the separate Actions configuration above.
Before publishing, merge or rebase the latest private `main` into the release
branch; the workflow rejects a branch that does not contain the latest public
`main` commit.

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
