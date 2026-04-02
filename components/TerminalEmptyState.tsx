import Link from "next/link";

interface TerminalEmptyStateProps {
  title: string;
  body: string;
  cta: string;
  href: string;
}

export function TerminalEmptyState({ title, body, cta, href }: TerminalEmptyStateProps) {
  return (
    <section className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-16">
      <div className="terminal-panel w-full p-8 text-center md:p-12">
        <div className="font-display text-4xl uppercase tracking-[0.08em]">REPPL INTELLIGENCE SYSTEM</div>
        <div className="mt-6 terminal-label">[{title}]</div>
        <div className="mt-4 text-sm uppercase text-[var(--ink-muted)]">{body}</div>
        <Link className="terminal-button mt-8 inline-flex" href={href}>
          {cta}
        </Link>
      </div>
    </section>
  );
}
