import { FormEvent, useEffect, useMemo, useState } from "react";

import type { AnalyzeProductPayload } from "../lib/types";

interface MissionFormProps {
  onSubmit: (payload: AnalyzeProductPayload) => Promise<void>;
  loading: boolean;
  error: string | null;
  initialFounderEmail?: string;
}

export function MissionForm({ onSubmit, loading, error, initialFounderEmail = "" }: MissionFormProps) {
  const fallbackTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
    []
  );
  const [productUrl, setProductUrl] = useState("");
  const [founderEmail, setFounderEmail] = useState(initialFounderEmail);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [timezone, setTimezone] = useState(fallbackTimezone);

  useEffect(() => {
    if (!initialFounderEmail) return;
    setFounderEmail(initialFounderEmail);
  }, [initialFounderEmail]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      product_url: productUrl,
      founder_email: founderEmail || undefined,
      slack_webhook_url: slackWebhookUrl || undefined,
      timezone,
      brief_time: "09:00",
    });
  }

  return (
    <form className="terminal-panel mx-auto max-w-4xl p-6 md:p-10" onSubmit={handleSubmit}>
      <div className="terminal-label">[INITIATE INTELLIGENCE SYSTEM]</div>
      <div className="mt-2 text-sm uppercase">{">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"}</div>
      <div className="mt-8 space-y-5">
        <label className="terminal-field">
          <span className="terminal-label">[ YOUR PRODUCT URL ________________________ ]</span>
          <input className="terminal-input" onChange={(event) => setProductUrl(event.target.value)} value={productUrl} />
        </label>
        <label className="terminal-field">
          <span className="terminal-label">[ YOUR EMAIL ______________________________ ]</span>
          <input className="terminal-input" onChange={(event) => setFounderEmail(event.target.value)} value={founderEmail} />
        </label>
        <div className="text-xs uppercase text-[var(--ink-muted)]">(BRIEF DELIVERED HERE EVERY MORNING)</div>
        <label className="terminal-field">
          <span className="terminal-label">[ SLACK WEBHOOK URL _______________________ ]</span>
          <input className="terminal-input" onChange={(event) => setSlackWebhookUrl(event.target.value)} value={slackWebhookUrl} />
        </label>
        <div className="text-xs uppercase text-[var(--ink-muted)]">(OPTIONAL - GET BRIEF IN SLACK TOO)</div>
        <label className="terminal-field">
          <span className="terminal-label">[ TIMEZONE: {timezone} v ]</span>
          <select className="terminal-input" onChange={(event) => setTimezone(event.target.value)} value={timezone}>
            {TIMEZONES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-8 flex flex-col gap-4">
        <button className="terminal-button" disabled={loading || !productUrl || !founderEmail} type="submit">
          {loading ? "[DEPLOYING AGENTS...]" : "[DEPLOY AGENTS >>>]"}
        </button>
        <div className="text-xs uppercase text-[var(--ink-muted)]">NO CREDIT CARD // 14-DAY FREE TRIAL</div>
        <div className="text-xs uppercase text-[var(--ink-muted)]">FIRST BRIEF: TOMORROW 09:00 HRS</div>
        {error ? <div className="text-xs uppercase">[{error}]</div> : null}
      </div>
    </form>
  );
}

const TIMEZONES = ["America/New_York", "Europe/London", "Asia/Dubai", "Asia/Kolkata", "UTC"];
