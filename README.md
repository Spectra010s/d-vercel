# d-vercel

Seamlessly deploy frontend and full-stack applications to Vercel directly from GitHub Actions.

This GitHub Action wraps the Vercel CLI to securely pull configuration, deploy your project, output the deployment URL, and optionally post interactive status updates as sticky comments directly onto Pull Requests.

---

## Who is this for?

- **Private & Enterprise Repositories**: Ideal for projects where Vercel's native Git Integration cannot be connected due to organization security policies or private repository constraints.
- **Monorepos**: Perfect for workspaces (e.g., Turborepo, Nx, or pnpm workspaces) where you need precise control over which directories get built and when.
- **Custom CI/CD Pipelines**: Great for teams that want to gate deployments, run automated testing (Cypress, Playwright) before/after deployment, or customize the build environment.

---

## Core Features

1.  **Zero-Configuration PR Comments**: Automatically creates a "sticky" comment on your Pull Request containing deployment status, preview links, commit hashes, and run logs, updating the same comment on subsequent commits.
2.  **Working Directory Support**: Native support for subfolders, making monorepo configurations effortless.
3.  **Ignored Build Steps in CI**: Run custom checks (like file changesets or Turbo filters) before wasting build minutes on Vercel.

---

## Setup & Credentials

Before adding the workflow, generate a Vercel Token and locate your Organization/Project IDs in your Vercel project settings, then add them as GitHub Actions Repository Secrets:

- `VERCEL_TOKEN` (Your Vercel Personal Access Token)
- `VERCEL_ORG_ID` (Your Vercel Team/Org ID)
- `VERCEL_PROJECT_ID` (Your Vercel Project ID)

---

## Quick Start Example

Add this workflow to `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write # Required for posting PR comments

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 24

      - name: Deploy to Vercel
        uses: Spectra010s/d-vercel@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          production: ${{ github.event_name == 'push' }}
```

---

## Inputs

| Input               | Required | Default               | Description                                                                                                          |
| :------------------ | :------- | :-------------------- | :------------------------------------------------------------------------------------------------------------------- |
| `vercel-token`      | **Yes**  | N/A                   | Your Vercel API authorization token.                                                                                 |
| `vercel-org-id`     | **Yes**  | N/A                   | Vercel Organization or Team ID.                                                                                      |
| `vercel-project-id` | **Yes**  | N/A                   | Vercel Project ID.                                                                                                   |
| `github-token`      | No       | `""`                  | The `${{ secrets.GITHUB_TOKEN }}`. Required if you want sticky PR deployment comments.                               |
| `production`        | No       | `"false"`             | Whether to deploy as production (`true` / `false`). If `false`, deploys as a preview.                                |
| `prebuilt`          | No       | `"false"`             | Whether to deploy prebuilt assets (`true` / `false`). If `true`, skips `vercel pull` and deploys using `--prebuilt`. |
| `working-directory` | No       | `"."`                 | Subdirectory to run Vercel commands from. Excellent for monorepos.                                                   |
| `ignore-build-step` | No       | `""`                  | Command/script to determine if the build should be skipped. Exiting with `0` cancels the build.                      |
| `vercel-version`    | No       | `"latest"`            | The specific Vercel CLI package/version to run (e.g. `latest` or `vercel@32.0.0`).                                   |
| `comment-title`     | No       | `"Vercel Deployment"` | Header title for the generated Pull Request comment.                                                                 |
| `sticky-comment`    | No       | `"true"`              | If `"true"`, updates a single "sticky" comment on the PR. If `"false"`, posts a new comment on each change.          |
| `fail-on-error`     | No       | `"true"`              | If set to `"true"`, fails the GitHub Action if the Vercel deployment command fails.                                  |

---

## Detailed Use Cases

### 1. Deploying from a Monorepo (`working-directory`)

If your frontend application lives in a subdirectory (e.g., `apps/web` inside a monorepo), set `working-directory` to point to it. The action will resolve all configuration paths, pull credentials, and execute the deployment inside that folder:

```yaml
- name: Deploy Frontend App
  uses: Spectra010s/d-vercel@v1
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
    working-directory: apps/web # <--- Deploys only the web package
```

### 2. Custom Ignored Build Steps (`ignore-build-step`)

To avoid building when unrelated files (e.g., backend API code, documentation, or configuration files) are modified, supply an `ignore-build-step` command.

This works exactly like Vercel's native "Ignored Build Step" feature:

- If the command exits with **`0`**, the deployment is **skipped** (the action exits successfully without building).
- If the command exits with **`1`** (or any non-zero code), the deployment **proceeds**.

#### Examples:

**A. Skip if no changes exist in the `apps/web` directory:**

```yaml
ignore-build-step: "git diff --quiet HEAD^ HEAD -- apps/web"
```

**B. Using Turborepo's native ignore check (`turbo-ignore`):**

```yaml
ignore-build-step: "npx turbo-ignore"
```

---

## Outputs

- `deployment-url`: The URL of the completed Vercel deployment.
- `status`: The final status of the deployment (`success`, `failure`, or `ignored`).

---

## Author

Created and maintained by [Spectra010s](https://spectra010s.biuld.app).
