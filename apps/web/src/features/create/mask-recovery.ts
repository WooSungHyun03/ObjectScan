import type { Job, ProjectImage } from "@objectscan/shared";
// Reads only the latest mask job; approval truth stays the server's mask_reviewed for the current revision.
export function maskRecovery(included: ProjectImage[], jobs: Job[] = []) {
  const job = jobs.find((j) => j.kind === "masks"); // the API lists jobs newest first
  return {
    failed: job?.state === "failed",
    missing:
      job?.state === "completed" ? included.filter((i) => !i.mask_url) : [],
  };
}
