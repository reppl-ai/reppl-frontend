import Head from "next/head";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LandingPage() {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistCategory, setWaitlistCategory] = useState("");
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [waitlistSuccess, setWaitlistSuccess] = useState<string | null>(null);

  function handleWaitlistSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = waitlistEmail.trim();
    if (!email) {
      setWaitlistSuccess(null);
      setWaitlistError("Enter your work email to apply for early access.");
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email);
    if (!isEmail) {
      setWaitlistSuccess(null);
      setWaitlistError("Enter a valid email address.");
      return;
    }

    if (!waitlistCategory) {
      setWaitlistSuccess(null);
      setWaitlistError("Choose your D2C category.");
      return;
    }

    setWaitlistError(null);
    setWaitlistSuccess("Application received. We will reach out when the next founder batch opens.");
    setWaitlistEmail("");
    setWaitlistCategory("");
  }

  return (
    <>
      <Head>
        <title>REPPL // EARLY ACCESS</title>
        <meta
          content="REPPL is a calmer market read for D2C founders."
          name="description"
        />
      </Head>
      <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
        <section className="border-b border-[var(--ink)] px-4 py-4 md:px-8">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 text-xs uppercase">
            <div className="font-display text-2xl tracking-[0.08em]">REPPL</div>
            <div className="hidden md:block text-[var(--ink-muted)]">A calmer way to read market pressure.</div>
            <div className="terminal-label text-[var(--ink-muted)]">[Preview Release]</div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1400px] gap-0 border-b border-[var(--ink)] md:grid-cols-[1.12fr_0.88fr]">
          <div className="reveal border-b border-[var(--ink)] p-6 md:border-b-0 md:border-r md:p-12" style={{ animationDelay: "0ms" }}>
            <div className="terminal-label">[Quote]</div>
            <div className="mt-6 max-w-4xl font-display text-6xl uppercase leading-[0.92] md:text-[7.3rem]">
              BEFORE THE NOISE,
              <br />
              SEE THE SIGNAL.
            </div>
            <div className="mt-6 max-w-2xl text-sm uppercase leading-8 text-[var(--ink-mid)] md:text-base">
              REPPL IS A DARK, CALM MARKET READ FOR FOUNDERS WHO NEED TO FEEL THE SHIFT BEFORE IT FEELS OBVIOUS.
            </div>
            <div className="mt-8 max-w-xl text-sm uppercase leading-8 text-[var(--ink-muted)]">
              FEW WORDS. CLEAR PRESSURE. ONE MEASURED NEXT STEP.
            </div>
            <div className="mt-10 grid gap-0 border-y border-[var(--ink)] md:grid-cols-3">
              <StatBlock label="Tone" value="CALM" />
              <StatBlock label="Read" value="SHORT" />
              <StatBlock label="Signal" value="CLEAR" />
            </div>
          </div>

          <div className="reveal p-6 md:p-12" id="preview" style={{ animationDelay: "100ms" }}>
            <div className="soft-panel p-5">
              <div className="terminal-row px-0 pb-3 pt-0">
                <span className="terminal-label">[Preview issue]</span>
                <span className="terminal-label">[Example delivery]</span>
              </div>
              <pre className="type-block pt-5">
                {`REPPL MORNING BRIEF

BRAND: BEARDO // GROOMING
FOCUS: WHAT CHANGED OVERNIGHT
----------------------------------------

MARKET SNAPSHOT
BEARDO LOWERED PRICE BY 14%.
URBAN GROOM PUSHED A 3-PACK PLUS
FREE SHIPPING. MAN COMPANY IS LOW
STOCK ON ITS TOP PDP.

----------------------------------------

WHAT THIS MEANS
VALUE-SEEKING BUYERS NOW HAVE A
STRONGER REASON TO COMPARE OPTIONS.
EXPECT PRESSURE ON CONVERSION BEFORE
LUNCH, NOT A LONG-TERM CRISIS.

----------------------------------------

RECOMMENDED MOVE
TEST A 2-PACK OFFER TODAY.
KEEP CORE PRICE STEADY. GIVE YOUR
TEAM ONE CLEAN THING TO RESPOND WITH.

----------------------------------------

[END OF NOTE]`}
              </pre>
            </div>
            <div className="mt-4 editorial-note">A founder brief designed to steady the room, not raise the temperature.</div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-12" id="waitlist">
          <div className="reveal grid gap-0 border border-[rgba(10,10,10,0.42)] bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(255,255,255,0.3))] md:grid-cols-[0.88fr_1.12fr]" style={{ animationDelay: "480ms" }}>
            <div className="border-b border-[var(--ink)] p-6 md:border-b-0 md:border-r md:p-10">
              <div className="terminal-label">[Early access]</div>
              <div className="mt-5 font-display text-5xl uppercase leading-none md:text-6xl">If this feels right, request a spot.</div>
              <div className="mt-5 max-w-xl text-sm uppercase leading-8 text-[var(--ink-mid)]">
                EARLY ACCESS FOR THE FIRST FOUNDER BATCH.
              </div>
            </div>
            <div className="grid gap-0">
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

              <form
                className="border-t border-[var(--ink)] p-6 md:p-8"
                onSubmit={handleWaitlistSubmit}
              >
                <div className="terminal-label">[Request access]</div>
                <div className="mt-5 grid gap-4">
                  <input
                    className="waitlist-input"
                    onChange={(event) => setWaitlistEmail(event.target.value)}
                    placeholder="WORK EMAIL"
                    type="email"
                    value={waitlistEmail}
                  />
                  <select
                    className="waitlist-input"
                    onChange={(event) => setWaitlistCategory(event.target.value)}
                    value={waitlistCategory}
                  >
                    <option value="">SELECT D2C CATEGORY</option>
                    {D2C_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {waitlistError ? (
                  <div className="mt-4 border border-[var(--ink)] bg-[rgba(180,104,68,0.12)] px-4 py-3 text-xs uppercase text-[var(--ink)]">
                    [{waitlistError}]
                  </div>
                ) : null}

                {waitlistSuccess ? (
                  <div className="mt-4 border border-[var(--ink)] bg-[rgba(102,116,94,0.12)] px-4 py-3 text-xs uppercase text-[var(--ink)]">
                    [{waitlistSuccess}]
                  </div>
                ) : null}

                <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="text-xs uppercase text-[var(--ink-muted)]">
                    Work email and category help us shape the founder batch.
                  </div>
                  <button className="terminal-button" type="submit">
                    {"[REQUEST SPOT >>>]"}
                  </button>
                </div>
              </form>
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

function StepCard({ index, text }: { index: string; text: string }) {
  return (
    <div className="border-b border-[var(--ink)] p-5 text-xs uppercase md:odd:border-r">
      <div className="terminal-label text-[var(--ink-muted)]">[{index}]</div>
      <div className="mt-4 leading-7 text-[var(--ink-mid)]">{text}</div>
    </div>
  );
}

const D2C_CATEGORIES = [
  "Beauty & Personal Care",
  "Fashion & Apparel",
  "Health & Wellness",
  "Food & Beverage",
  "Home & Living",
  "Electronics & Gadgets",
  "Baby & Kids",
  "Pet Care",
  "Jewelry & Accessories",
  "Other",
];
