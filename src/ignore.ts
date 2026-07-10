import * as core from "@actions/core";
import * as exec from "@actions/exec";

export async function shouldIgnoreBuild(
  ignoreCommand: string,
  cwd: string,
): Promise<boolean> {
  if (!ignoreCommand) return false;

  core.info(`Running ignore command: ${ignoreCommand}`);
  let shell = "bash";
  let shellArgs = ["-c", ignoreCommand];
  if (process.platform === "win32") {
    shell = "powershell";
    shellArgs = ["-Command", ignoreCommand];
  }

  try {
    const exitCode = await exec.exec(shell, shellArgs, {
      cwd,
      ignoreReturnCode: true,
    });
    if (exitCode === 0) {
      core.info("Build ignored based on ignore command (exited with 0).");
      return true;
    }
    core.info(`Ignore command exited with ${exitCode}. Proceeding with build.`);
  } catch (err) {
    core.warning(
      `Ignore command failed to execute: ${String(err)}. Proceeding with build.`,
    );
  }

  return false;
}
