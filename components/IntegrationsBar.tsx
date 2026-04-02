import { FormEvent, useState } from "react";

import type { IntegrationStatus } from "../lib/types";

interface IntegrationsBarProps {
  integrations: IntegrationStatus | null;
  onConnect: (webhookUrl: string) => Promise<void>;
}

export function IntegrationsBar({ integrations, onConnect }: IntegrationsBarProps) {
  const [open, setOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!webhookUrl) return;
    setSubmitting(true);
    try {
      await onConnect(webhookUrl);
      setWebhookUrl("");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="terminal-panel reveal p-0" style={{ animationDelay: "260ms" }}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs uppercase">
        <span>EMAIL: {integrations?.founder_email || "NOT SET"} {integrations?.email_active ? "[ACTIVE *]" : "[PENDING]"}</span>
        <button className="terminal-link" onClick={() => setOpen((value) => !value)} type="button">
          {integrations?.slack_connected ? "[CONNECTED]" : "[ADD SLACK >>>]"}
        </button>
      </div>
      {open ? (
        <form className="border-t border-dashed border-[var(--ink)] p-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              className="terminal-input flex-1"
              onChange={(event) => setWebhookUrl(event.target.value)}
              placeholder="[ PASTE WEBHOOK URL ___________ ]"
              value={webhookUrl}
            />
            <button className="terminal-button" disabled={submitting || !webhookUrl} type="submit">
              {submitting ? "[CONNECTING...]" : "[CONNECT]"}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
