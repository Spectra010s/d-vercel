import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as github from "@actions/github";
import path from "node:path";

type CommentBodyInput = {
  marker: string;
  title: string;
  repoName: string;
  status: string;
  commitSha: string;
  deploymentUrl: string;
  runUrl: string;
};

type UpsertPrCommentInput = {
  token: string;
  owner: string;
  repo: string;
  issueNumber: number;
  marker: string;
  body: string;
};

function asBool(value: string): boolean {
  return value.toLowerCase() === "true";
}

function shortSha(sha: string): string {
  return sha ? sha.slice(0, 7) : "unknown";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getVercelBin(version: string): string {
  const value = version.trim() || "latest";
  return value.startsWith("vercel@") ? value : `vercel@${value}`;
}

function extractDeploymentUrl(output: string): string {
  const matches = output.match(/https:\/\/[^\s'"]+\.vercel\.app/g);
  return matches?.at(-1) ?? "";
}

function makeCommentBody({
  marker,
  title,
  repoName,
  status,
  commitSha,
  deploymentUrl,
  runUrl,
}: CommentBodyInput): string {
  const safeRepoName = escapeHtml(repoName);
  const safeStatus = escapeHtml(status);
  const safeCommit = escapeHtml(shortSha(commitSha));
  const safeRunUrl = escapeHtml(runUrl);
  const safeDeploymentUrl = deploymentUrl ? escapeHtml(deploymentUrl) : "";
  const previewCell = deploymentUrl
    ? `<a href="${safeDeploymentUrl}">${safeDeploymentUrl}</a>`
    : "Not available";

  return [
    marker,
    `## ${title}`,
    "",
    "<table>",
    `<tr><td><strong>Status:</strong></td><td>${safeStatus}</td></tr>`,
    `<tr><td><strong>Preview URL:</strong></td><td>${previewCell}</td></tr>`,
    `<tr><td><strong>Project:</strong></td><td><code>${safeRepoName}</code></td></tr>`,
    `<tr><td><strong>Commit:</strong></td><td><code>${safeCommit}</code></td></tr>`,
    `<tr><td><strong>Workflow:</strong></td><td><a href="${safeRunUrl}">View run</a></td></tr>`,
    "</table>",
  ].join("\n");
}

async function upsertPrComment({
  token,
  owner,
  repo,
  issueNumber,
  marker,
  body,
}: UpsertPrCommentInput): Promise<void> {
  if (!token || !issueNumber) return;

  const octokit = github.getOctokit(token);
  const comments = await octokit.paginate(octokit.rest.issues.listComments, {
    owner,
    repo,
    issue_number: issueNumber,
    per_page: 100,
  });


  const existing = comments.find(
  (comment: { body?: string; id: number }) => comment.body?.includes(marker),
);
  if (existing) {
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: existing.id,
      body,
    });
    return;
  }

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });
}

async function run(): Promise<void> {
  const vercelToken = core.getInput("vercel-token", { required: true });
  const vercelOrgId = core.getInput("vercel-org-id", { required: true });
  const vercelProjectId = core.getInput("vercel-project-id", { required: true });
  const githubToken = core.getInput("github-token");
  const vercelBin = getVercelBin(core.getInput("vercel-version"));
  const production = asBool(core.getInput("production"));
  const workingDirectory = core.getInput("working-directory") || ".";
  const marker = core.getInput("marker") || "<!-- vercel-sticky-comment -->";
  const commentTitle = core.getInput("comment-title") || "Vercel Deployment";
  const failOnError = asBool(core.getInput("fail-on-error"));

  const environment = production ? "production" : "preview";
  const context = github.context;
  const repoName = context.repo.repo;
  const runUrl = `${process.env.GITHUB_SERVER_URL || "https://github.com"}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;

  core.exportVariable("VERCEL_TOKEN", vercelToken);
  core.exportVariable("VERCEL_ORG_ID", vercelOrgId);
  core.exportVariable("VERCEL_PROJECT_ID", vercelProjectId);

  const cwd = path.resolve(workingDirectory);
  core.info(`Deploy environment: ${environment}`);
  core.info(`Working directory: ${cwd}`);
  core.info(`Vercel CLI: ${vercelBin}`);

  await exec.exec(
    "npx",
    ["-y", vercelBin, "pull", "--yes", `--environment=${environment}`, `--token=${vercelToken}`],
    { cwd },
  );

  let combinedOutput = "";
  let exitCode = 0;
  const deployArgs = ["-y", vercelBin, "deploy", "--yes", `--token=${vercelToken}`];
  if (production) deployArgs.splice(3, 0, "--prod");

  try {
    exitCode = await exec.exec("npx", deployArgs, {
      cwd,
      ignoreReturnCode: true,
      listeners: {
        stdout: (data: Buffer) => {
          combinedOutput += data.toString();
        },
        stderr: (data: Buffer) => {
          combinedOutput += data.toString();
        },
      },
    });
  } catch (err) {
    exitCode = 1;
    combinedOutput += `\n${String(err)}`;
  }

  const deploymentUrl = extractDeploymentUrl(combinedOutput);
  const status = exitCode === 0 ? "success" : "failure";

  core.setOutput("deployment-url", deploymentUrl);
  core.setOutput("status", status);

  if (context.eventName === "pull_request" && context.payload.pull_request) {
    const issueNumber = context.payload.pull_request.number;
    const commitSha = context.payload.pull_request.head.sha;
    const statusLabel = status === "success" ? "Ready" : "Failed";
    const commentBody = makeCommentBody({
      marker,
      title: commentTitle,
      repoName,
      status: statusLabel,
      commitSha,
      deploymentUrl,
      runUrl,
    });

    await upsertPrComment({
      token: githubToken,
      owner: context.repo.owner,
      repo: context.repo.repo,
      issueNumber,
      marker,
      body: commentBody,
    });
  }

  if (status === "failure") {
    if (failOnError) {
      core.setFailed("Vercel deployment failed.");
      return;
    }
    core.warning("Vercel deployment failed, but fail-on-error=false so action will continue.");
  }
}

run().catch((error: unknown) => {
  core.setFailed(error instanceof Error ? error.message : String(error));
});
