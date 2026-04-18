import type { NextApiRequest, NextApiResponse } from "next";

import {
  createAnalysisJob,
  sendNoStore,
  startAnalysisJob,
  type AnalyzeJobInput,
  type MarginRange,
  type Positioning,
} from "../../lib/reppl-analysis";

const POSITIONING_OPTIONS: Positioning[] = ["premium", "mid-range", "budget"];
const MARGIN_OPTIONS: MarginRange[] = ["<20%", "20-40%", "40%+"];

export default function handler(req: NextApiRequest, res: NextApiResponse): void {
  sendNoStore(res);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body;
  const payload = validatePayload(body);

  if (!payload) {
    res.status(400).json({ error: "Please provide a valid product URL." });
    return;
  }

  const job = createAnalysisJob(payload);
  void startAnalysisJob(job.job_id);

  res.status(200).json({ job_id: job.job_id });
}

function validatePayload(body: unknown): AnalyzeJobInput | null {
  if (!body || typeof body !== "object") return null;

  const { product_url, positioning, margin } = body as {
    product_url?: unknown;
    positioning?: unknown;
    margin?: unknown;
  };

  if (typeof product_url !== "string" || !isLikelyUrl(product_url)) return null;

  return {
    product_url,
    positioning: POSITIONING_OPTIONS.includes(positioning as Positioning) ? (positioning as Positioning) : null,
    margin: MARGIN_OPTIONS.includes(margin as MarginRange) ? (margin as MarginRange) : null,
  };
}

function isLikelyUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
