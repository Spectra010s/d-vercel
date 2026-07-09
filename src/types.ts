export type CommentBodyInput = {
  marker: string;
  title: string;
  repoName: string;
  status: string;
  commitSha: string;
  deploymentUrl: string;
  runUrl: string;
};

export type UpsertPrCommentInput = {
  token: string;
  owner: string;
  repo: string;
  issueNumber: number;
  marker: string;
  body: string;
};
