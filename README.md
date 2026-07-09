# d-vercel

Seamlessly deploy frontend and full-stack applications to Vercel from GitHub Actions.

This action runs the Vercel CLI, returns the deployment URL, and can create or update a pull request comment with the latest deployment.

## Usage

Create a Vercel token and add these secrets to your repository or organization:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Then add a workflow:

```yaml
name: Deploy Preview
on:
  pull_request:

permissions:
  contents: read
  pull-requests: write

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
```

## Inputs

- `vercel-token` (required)
- `vercel-org-id` (required)
- `vercel-project-id` (required)
- `github-token` (optional, needed for PR comments)
- `vercel-version` (optional, default `latest`)
- `production` (optional, default `false`)
- `working-directory` (optional, default `.`)
- `marker` (optional, default `<!-- vercel-sticky-comment -->`)
- `comment-title` (optional, default `Vercel Deployment`)
- `fail-on-error` (optional, default `true`)

## Outputs

- `deployment-url`
- `status`

## Production Deployments

Set `production` to `true`:

```yaml
with:
  production: "true"
```

## Author

[Spectra010s](https://spectra010s.biuld.app)
