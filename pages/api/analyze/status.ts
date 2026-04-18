import type { NextApiRequest, NextApiResponse } from "next";

import { getAnalysisJob, sendNoStore } from "../../../lib/reppl-analysis";

export default function handler(req: NextApiRequest, res: NextApiResponse): void {
  sendNoStore(res);

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const jobId = readJobId(req.query.job_id);
  const job = getAnalysisJob(jobId);

  if (!job) {
    res.status(404).json({ error: "Analysis job not found." });
    return;
  }

  res.status(200).json({
    job_id: job.job_id,
    status: job.status,
    current_step: job.current_step,
    steps: job.steps,
    error_message: job.error_message,
  });
}

function readJobId(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  return null;
}
