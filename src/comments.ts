import * as github from "@actions/github";
import { CommentBodyInput, UpsertPrCommentInput } from "./types.js";

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

export function makeCommentBody({
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

export async function upsertPrComment({
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
