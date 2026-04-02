import Head from "next/head";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>REPPL // THEY MOVED. YOU PAID.</title>
        <meta
          content="Daily market warnings for D2C founders. What changed overnight. What revenue it likely hit. What to do before demand moves again."
          name="description"
        />
      </Head>
      <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
        <section className="border-b border-[var(--ink)] px-4 py-4 md:px-8">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 text-xs uppercase">
            <div className="font-display text-2xl tracking-[0.08em]">REPPL</div>
            <div className="hidden md:block">DELAY COSTS REVENUE.</div>
            <div className="flex gap-3">
              <Link className="terminal-link" href="/dashboard">
                [DASHBOARD]
              </Link>
              <Link className="terminal-button" href="/onboard">
                {"[START DAILY BRIEF >>>]"}
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1400px] gap-0 border-b border-[var(--ink)] md:grid-cols-[1.2fr_0.8fr]">
          <div className="reveal border-b border-[var(--ink)] p-6 md:border-b-0 md:border-r md:p-12" style={{ animationDelay: "0ms" }}>
            <div className="terminal-label">[FOUNDER WARNING SYSTEM]</div>
            <div className="mt-6 font-display text-6xl uppercase leading-none md:text-[7.5rem]">
              THEY MOVED.
              <br />
              YOU PAID.
            </div>
            <div className="mt-6 max-w-2xl text-sm uppercase leading-8 text-[var(--ink-mid)] md:text-base">
              A PRICE CUT, BUNDLE PUSH, OR STOCK SHIFT CAN PULL DEMAND IN 24 HOURS.
              MOST FOUNDERS SEE IT AFTER SALES SOFTEN.
              REPPL TELLS YOU WHAT CHANGED, WHAT IT LIKELY COST, AND WHAT TO DO THIS MORNING.
            </div>
            <div className="mt-10 flex flex-col gap-4 md:flex-row">
              <Link className="terminal-button" href="/onboard">
                {"[START DAILY BRIEF >>>]"}
              </Link>
              <Link className="terminal-button" href="/dashboard">
                {"[SEE SAMPLE INTELLIGENCE >>>]"}
              </Link>
            </div>
            <div className="mt-10 grid gap-0 border-y border-[var(--ink)] md:grid-cols-3">
              <StatBlock label="MARKET MOVES" value="OVERNIGHT" />
              <StatBlock label="WARNING TIME" value="09:00 HRS" />
              <StatBlock label="TIME TO DECIDE" value="60 SEC" />
            </div>
          </div>

          <div className="reveal p-6 md:p-12" style={{ animationDelay: "100ms" }}>
            <div className="terminal-panel p-5">
              <div className="terminal-row px-0 pb-3 pt-0">
                <span className="terminal-label">[TRANSMISSION SAMPLE]</span>
                <span className="terminal-label">[TODAY 09:00]</span>
              </div>
              <pre className="type-block pt-5">
                {`REPPL DAILY BRIEF

OPERATOR: BEARDO // GROOMING
CLASSIFICATION: EYES ONLY
----------------------------------------

MARKET SUMMARY
BEARDO CUT PRICE 14% LAST NIGHT.
URBAN GROOM ADDED A 3-PACK PLUS FREE
SHIPPING. MAN COMPANY WENT LOW STOCK
ON ITS BESTSELLER BEFORE 07:00.

----------------------------------------

IMPACT SIGNAL
THIS LIKELY IMPACTED YOUR REVENUE.
VALUE-SEEKING BUYERS HAD A BETTER REASON
TO LEAVE YOUR PDP. IF YOU REACT TOMORROW,
TODAY'S LOST DEMAND IS GONE.

----------------------------------------

COMMAND RECOMMENDATION
LAUNCH A 2-PACK OFFER BEFORE NOON.
HOLD CORE PRICE. PROTECT MARGIN WHILE
YOU ABSORB LOST DEMAND TODAY.

----------------------------------------

[TRANSMISSION ENDS]`}
              </pre>
            </div>
            <div className="mt-4 text-xs uppercase text-[var(--ink-muted)]">
              THE REVENUE WARNING. DELIVERED BY 09:00.
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1400px] gap-0 border-b border-[var(--ink)] md:grid-cols-3">
          <InfoPanel
            delay="160ms"
            body="PRICE CUTS, BUNDLES, STOCK SHIFTS, AND SHIPPING PLAYS MOVE DEMAND FAST. MISS A DAY AND YOU REACT AFTER THE REVENUE MOVE, NOT BEFORE IT."
            title="WHAT HIT YOU"
          />
          <InfoPanel
            delay="220ms"
            body="COMPETITORS CHANGE THE OFFER OVERNIGHT. MOST FOUNDERS FIND OUT AFTER CONVERSION SOFTENS OR MARGIN GETS SQUEEZED."
            title="WHY YOU WERE LATE"
          />
          <InfoPanel
            delay="280ms"
            body="YOU GET THE CAUSE, THE RISK, AND ONE CLEAR MOVE. NO DIGGING. NO DELAYED REACTION. NO WATCHING MARGIN ERODE IN REAL TIME."
            title="WHAT TO DO NOW"
          />
        </section>

        <section className="mx-auto max-w-[1400px] border-b border-[var(--ink)] px-4 py-8 md:px-8 md:py-12">
          <div className="reveal grid gap-0 md:grid-cols-[0.8fr_1.2fr]" style={{ animationDelay: "340ms" }}>
            <div className="border-b border-[var(--ink)] p-6 md:border-b-0 md:border-r md:p-8">
              <div className="terminal-label">[FOUNDER LOOP]</div>
              <div className="mt-4 font-display text-4xl uppercase md:text-5xl">SEE THE MOVE. SAVE THE DAY.</div>
            </div>
            <div className="grid gap-0 md:grid-cols-2">
              <StepCard
                index="01"
                text="PASTE YOUR PRODUCT URL. REPPL WATCHES THE BRANDS THAT CAN TAKE DEMAND FROM YOU."
              />
              <StepCard
                index="02"
                text="WHEN THEY CUT PRICE, PUSH A BUNDLE, OR SHIFT STOCK, YOU SEE IT BEFORE THE DAY GETS AWAY FROM YOU."
              />
              <StepCard
                index="03"
                text="EACH MOVE IS TIED TO THE LIKELY HIT: LOST DEMAND, PRICE PRESSURE, OR MARGIN EROSION."
              />
              <StepCard
                index="04"
                text="BY 09:00, YOU GET ONE CLEAR CALL SO YOU ACT EARLY INSTEAD OF READING A BAD SALES REPORT LATER."
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
          <div className="reveal terminal-panel p-6 text-center md:p-10" style={{ animationDelay: "400ms" }}>
            <div className="terminal-label">[STOP THE LEAK]</div>
            <div className="mt-6 font-display text-5xl uppercase md:text-6xl">STOP PAYING FOR DELAY.</div>
            <div className="mx-auto mt-6 max-w-3xl text-sm uppercase leading-8 text-[var(--ink-mid)]">
              IF YOU FIND OUT TOMORROW, TODAY'S REVENUE IS ALREADY GONE.
              REPPL SHOWS YOU WHAT CHANGED, WHAT IT LIKELY COST, AND THE NEXT MOVE TO MAKE.
            </div>
            <div className="mt-8 flex flex-col justify-center gap-4 md:flex-row">
              <Link className="terminal-button" href="/onboard">
                {"[START DAILY BRIEF >>>]"}
              </Link>
              <Link className="terminal-button" href="/dashboard">
                {"[SEE SAMPLE INTELLIGENCE >>>]"}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--ink)] px-4 py-5 text-left text-xs uppercase last:border-b-0 md:border-b-0 md:border-r last:md:border-r-0">
      <div className="text-[var(--ink-muted)]">{label}</div>
      <div className="mt-3 font-display text-3xl">{value}</div>
    </div>
  );
}

function InfoPanel({ title, body, delay }: { title: string; body: string; delay: string }) {
  return (
    <div className="reveal border-b border-[var(--ink)] p-6 last:border-b-0 md:border-b-0 md:border-r last:md:border-r-0 md:p-8" style={{ animationDelay: delay }}>
      <div className="terminal-label">[{title}]</div>
      <div className="mt-4 text-sm uppercase leading-8 text-[var(--ink-mid)]">{body}</div>
    </div>
  );
}

function StepCard({ index, text }: { index: string; text: string }) {
  return (
    <div className="border-b border-[var(--ink)] p-6 text-sm uppercase leading-8 text-[var(--ink-mid)] last:border-b-0 md:border-r md:last:border-b-0 even:md:border-r-0 md:p-8">
      <div className="terminal-label">[{index}]</div>
      <div className="mt-4">{text}</div>
    </div>
  );
}
