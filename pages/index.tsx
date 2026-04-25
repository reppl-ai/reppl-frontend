import Head from "next/head";
import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";

const brief = `BRAND: BEARDO // GROOMING
FOCUS: WHAT CHANGED OVERNIGHT
----------------------------------------

MARKET SNAPSHOT
BEARDO LOWERED PRICE BY 14%.
URBAN GROOM PUSHED A 3-PACK PLUS
FREE SHIPPING. MAN COMPANY IS LOW
STOCK ON ITS TOP PDP.

----------------------------------------

RECOMMENDED MOVE
TEST A 2-PACK OFFER TODAY.
KEEP CORE PRICE STEADY.
GIVE YOUR TEAM ONE CLEAN THING
TO RESPOND WITH.

----------------------------------------
[END OF NOTE]`;

const story = [
  {
    text: "CALM\nSHORT\nCLEAR",
    card: <BriefStoryCard />,
  },
  {
    text: "YOUR MARKET\nMOVES WHILE\nYOU SLEEP.",
    card: <SignalsCard />,
  },
  {
    text: "ONE ISSUE.\nONE MOVE.\nNOTHING ELSE.",
    card: <DecisionCard />,
  },
  {
    text: "WILL AI\nRECOMMEND\nYOU?",
    card: <AiCard />,
  },
  {
    text: "KNOW BEFORE\nTHEY STRIKE.",
    card: <DeliveryCard />,
  },
];

export default function LandingPage() {
  const [heroText, setHeroText] = useState("");
  const [activeStory, setActiveStory] = useState(0);
  const [tab, setTab] = useState<"preview" | "delivery">("preview");
  const storyRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      let index = 0;
      const interval = window.setInterval(() => {
        setHeroText(brief.slice(0, index));
        index += 1;
        if (index > brief.length) window.clearInterval(interval);
      }, 20);
    }, 600);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = storyRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const max = rect.height - window.innerHeight;
      const progress = Math.min(0.999, Math.max(0, -rect.top / max));
      setActiveStory(Math.floor(progress * story.length));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(".landing-reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.2 }
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  function handleDemo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <>
      <Head>
        <title>Reppl — AI Decision System for D2C Brands</title>
        <meta content="A calmer way to read market pressure." name="description" />
        <meta content="https://reppl.com" property="og:url" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </Head>

      <main className="min-h-screen bg-[#F5F4EF] text-[#0A0A0A]">
        <Nav />

        <section className="grid min-h-screen border-b border-[#0A0A0A] pt-14 md:grid-cols-2">
          <div className="landing-hero-left flex items-center border-b border-[#0A0A0A] p-6 md:border-b-0 md:border-r md:p-20">
            <div className="landing-load">
              <h1 className="font-display text-[64px] uppercase leading-[0.92] md:text-[clamp(72px,8vw,120px)]">
                YOUR
                <br />
                COMPETITORS
                <br />
                MOVED LAST
                <br />
                NIGHT.
              </h1>
              <p className="mt-6 font-mono text-sm text-[#7A7A7A]">Did you know what they did?</p>
              <div className="mt-8 space-y-2 font-mono text-xs">
                <p>REPPL AGENTS NEVER STOP. ✦</p>
                <p>YOUR BRIEF ARRIVES AT 09:00. ✦</p>
              </div>
              <form className="mt-12 flex flex-col gap-3 md:flex-row" onSubmit={handleDemo}>
                <input className="reppl-field flex-1" placeholder="PASTE YOUR PRODUCT URL" />
                <button className="reppl-btn-dark" type="submit">[ANALYZE &gt;&gt;&gt;]</button>
              </form>
              <p className="mt-4 whitespace-pre-line font-mono text-[11px] text-[#7A7A7A]">NO SIGNUP REQUIRED //{"\n"}DEMO IN 30 SECONDS</p>
            </div>
          </div>

          <div className="landing-hero-card flex items-center p-6 md:p-20">
            <div className="w-full">
              <BriefCard text={heroText} compact />
              <p className="mt-5 whitespace-pre-line font-mono text-[11px] uppercase leading-5 tracking-[0.12em] text-[#7A7A7A]">
                A FOUNDER BRIEF DESIGNED TO{"\n"}STEADY THE ROOM, NOT RAISE{"\n"}THE TEMPERATURE.
              </p>
            </div>
          </div>
        </section>

        <section ref={storyRef} className="hidden h-[500vh] border-b border-[#0A0A0A] md:grid md:grid-cols-2">
          <div className="sticky top-0 flex h-screen items-center border-r border-[#0A0A0A] pl-20">
            <div className="relative w-full">
              {story.map((item, index) => (
                <StoryText key={item.text} active={activeStory === index}>{item.text}</StoryText>
              ))}
              <div className="absolute bottom-[-180px] left-0 flex gap-[10px] font-mono text-[8px]">
                {story.map((_, index) => <span key={index}>{activeStory === index ? "■" : "□"}</span>)}
              </div>
            </div>
          </div>
          <div className="sticky top-0 flex h-screen items-start justify-end overflow-hidden py-20 pr-20">
            <div className="relative h-full w-full max-w-[520px]">
              {story.map((item, index) => (
                <div key={index} className={activeStory === index ? "story-card is-active" : "story-card"}>
                  {index === 0 ? <BriefStoryCard tab={tab} onTab={setTab} /> : item.card}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#0A0A0A] md:hidden">
          {story.map((item, index) => (
            <div key={index} className="border-b border-[#0A0A0A] p-6">
              <pre className="font-display text-[56px] uppercase leading-[0.92]">{item.text}</pre>
              <div className="mt-8">{index === 0 ? <BriefStoryCard tab={tab} onTab={setTab} /> : item.card}</div>
            </div>
          ))}
        </section>

        <MarketSection />
        <HowItWorks />
        <SocialProof />
        <Pricing />
        <FinalCta onSubmit={handleDemo} />
        <Footer />
      </main>

      <style jsx global>{`
        .reppl-field {
          border: 1px solid #0A0A0A;
          background: transparent;
          color: #0A0A0A;
          padding: 12px 16px;
          font: 13px "IBM Plex Mono", monospace;
          outline: none;
        }
        .reppl-field::placeholder { color: #7A7A7A; }
        .reppl-btn-dark {
          border: 1px solid #0A0A0A;
          background: #0A0A0A;
          color: #F5F4EF;
          padding: 12px 24px;
          font: 700 13px "IBM Plex Mono", monospace;
          transition: 150ms ease;
        }
        .reppl-btn-dark:hover { background: transparent; color: #0A0A0A; }
        .reppl-btn-light {
          border: 1px solid #F5F4EF;
          background: #F5F4EF;
          color: #0A0A0A;
          padding: 12px 24px;
          font: 700 13px "IBM Plex Mono", monospace;
          transition: 150ms ease;
        }
        .reppl-btn-light:hover { background: transparent; color: #F5F4EF; }
        .landing-load { animation: loadIn 600ms ease-out 100ms both; }
        .landing-hero-card { animation: fadeIn 800ms ease-out 300ms both; }
        .landing-reveal { opacity: 0; transform: translateY(16px); transition: opacity 500ms ease-out, transform 500ms ease-out; }
        .landing-reveal.is-visible { opacity: 1; transform: translateY(0); }
        .story-text { opacity: 0; transform: translateY(24px); transition: opacity 280ms ease-in, transform 280ms ease-in; }
        .story-text.is-active { opacity: 1; transform: translateY(0); transition: opacity 320ms ease-out 120ms, transform 320ms ease-out 120ms; }
        .story-card {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-start;
          opacity: 0;
          overflow-y: auto;
          padding-right: 8px;
          pointer-events: none;
          scrollbar-width: thin;
          transition: opacity 220ms ease;
        }
        .story-card.is-active { opacity: 1; pointer-events: auto; transition: opacity 300ms ease 80ms; }
        .story-card > * { width: 100%; }
        .reppl-card { border: 1px dashed #0A0A0A; background: transparent; transition: border-width 150ms ease; }
        .reppl-card:hover { border-width: 2px; }
        .market-shadow::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(135deg, transparent 0 38%, rgba(10,10,10,0.3) 38% 67%, transparent 67%);
        }
        @keyframes loadIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}

function Nav() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-[100] flex h-14 items-center justify-between border-b border-[#0A0A0A] bg-[#F5F4EF] px-4 md:px-20">
      <div>
        <div className="font-mono text-base font-bold leading-none">REPPL</div>
        <div className="mt-1 hidden font-mono text-[10px] text-[#7A7A7A] md:block">A CALMER WAY TO READ MARKET PRESSURE.</div>
      </div>
      <div className="flex items-center gap-4 font-mono text-xs">
        <span className="hidden text-[#7A7A7A] md:inline">[PREVIEW RELEASE]</span>
        <Link className="hidden opacity-60 transition-opacity duration-100 hover:opacity-100 md:inline" href="/system">[WORKSPACE]</Link>
        <Link className="hidden opacity-60 transition-opacity duration-100 hover:opacity-100 md:inline" href="/login">[LOGIN]</Link>
        <Link className="border border-[#0A0A0A] px-3 py-2 transition-colors duration-150 hover:bg-[#0A0A0A] hover:text-[#F5F4EF]" href="/signup">[SIGN UP &gt;&gt;&gt;]</Link>
      </div>
    </nav>
  );
}

function StoryText({ active, children }: { active: boolean; children: string }) {
  return (
    <pre className={`story-text absolute left-0 top-1/2 -translate-y-1/2 font-display text-[clamp(80px,9vw,120px)] uppercase leading-[0.92] ${active ? "is-active" : ""}`}>
      {children}
    </pre>
  );
}

function BriefCard({ text = brief, compact = false }: { text?: string; compact?: boolean }) {
  return (
    <div className="reppl-card w-full p-5 font-mono text-xs uppercase leading-6">
      <div className="flex justify-between border-b border-[#0A0A0A] pb-3">
        <span>[REPPL BRIEF]</span>
        <span>09:00 HRS ✦</span>
      </div>
      <pre className={`whitespace-pre-wrap pt-5 font-mono ${compact ? "max-h-[540px] overflow-hidden" : ""}`}>{text}</pre>
    </div>
  );
}

function BriefStoryCard({ tab = "preview", onTab }: { tab?: "preview" | "delivery"; onTab?: (tab: "preview" | "delivery") => void }) {
  return (
    <div className="reppl-card p-5 font-mono text-xs uppercase leading-6">
      <div className="flex gap-6 border-b border-[#0A0A0A]">
        {(["preview", "delivery"] as const).map((item) => (
          <button
            key={item}
            className={`pb-3 ${tab === item ? "border-b-2 border-[#0A0A0A]" : ""}`}
            type="button"
            onClick={() => onTab?.(item)}
          >
            {item === "preview" ? "[PREVIEW ISSUE]" : "[EXAMPLE DELIVERY]"}
          </button>
        ))}
      </div>
      <pre className="whitespace-pre-wrap pt-5 font-mono">
        {tab === "preview" ? brief : `DELIVERED TO YOUR SLACK AT 09:00\n\n${brief}`}
      </pre>
    </div>
  );
}

function SignalsCard() {
  return <InfoCard title="[MARKET SIGNALS]    OVERNIGHT ✦">{`● HIGH  Beardo dropped price 14%
        Detected: 03:42 AM

◆ MED   Urban Groom launched
        3-pack bundle
        Detected: 05:17 AM

· LOW   Man Company low stock
        on hero product
        Detected: 07:03 AM

----------------------------------------
3 SIGNALS DETECTED WHILE YOU SLEPT.
REPPL AGENTS NEVER STOP.

NEXT SCAN IN: 11:42:07`}</InfoCard>;
}

function DecisionCard() {
  return (
    <InfoCard title="[DECISION ENGINE]    COMPLETE ✦">
      <div className="font-mono text-xs uppercase leading-6">
        <p>PRIMARY ISSUE</p>
        <p className="mt-4 font-display text-[42px] leading-none">"YOUR BUNDLE OFFER<br />IS MISSING VS<br />THE MARKET"</p>
        <Divider />
        <p>WHY &gt;&gt;&gt;</p>
        <p>◆ 3 of 5 competitors have bundles</p>
        <p>◆ Your AOV is 22% below average</p>
        <p>◆ Bundle buyers convert 34% faster</p>
        <p className="mt-4">MOVE &gt;&gt;&gt;</p>
        <p>01 / TEST A 2-PACK OFFER TODAY</p>
        <p>02 / KEEP CORE PRICE STEADY</p>
        <Divider />
        <p>WE CONSIDERED: discount ✗</p>
        <p>WE SELECTED: bundle ✓</p>
      </div>
    </InfoCard>
  );
}

function AiCard() {
  return (
    <InfoCard title="[AI DISCOVERABILITY]">
      <div className="font-mono text-xs uppercase leading-6">
        <p>YOUR SCORE</p>
        <p className="font-display text-[80px] leading-none">MEDIUM</p>
        <p>■ ■ □ □ □ □ □ □ □ □ □ □</p>
        <p>    ↑ YOU  (#3 OF 12)</p>
        <Divider />
        <p>WHY THIS SCORE:</p>
        <p>· AI surfaces fewer alternatives</p>
        <p>· Generic category terms indexing</p>
        <p>· No comparison content on PDP</p>
        <p className="mt-4">HOW TO IMPROVE:</p>
        <p>◆ Add comparison proof above fold</p>
        <p>◆ Tighten category language on PDP</p>
        <p>◆ Build structured positioning copy</p>
        <p className="mt-4">[RECHECK RANKING &gt;&gt;&gt;]</p>
      </div>
    </InfoCard>
  );
}

function DeliveryCard() {
  return <InfoCard title="[SIGNAL DELIVERED]    09:00 HRS ✦">{`SENT TO:
SLACK ✦    EMAIL ✦    TELEGRAM ···

----------------------------------------

REPPL MORNING BRIEF

BEARDO LOWERED PRICE BY 14%.
URBAN GROOM PUSHED 3-PACK.
MAN COMPANY LOW ON HERO PDP.

YOUR MOVE: TEST 2-PACK TODAY.

----------------------------------------

DELIVERED BEFORE YOU OPENED
YOUR LAPTOP.

NEXT BRIEF: TOMORROW 09:00 HRS`}</InfoCard>;
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="reppl-card p-5 font-mono text-xs uppercase leading-6">
      <div className="border-b border-[#0A0A0A] pb-3">{title}</div>
      <div className="pt-5 whitespace-pre-wrap">{children}</div>
    </div>
  );
}

function Divider() {
  return <div className="my-5 border-t border-[#0A0A0A]" />;
}

function MarketSection() {
  return (
    <section className="grid border-b border-[#0A0A0A] md:grid-cols-2">
      <div className="flex justify-center border-b border-[#0A0A0A] p-6 md:border-b-0 md:border-r md:p-20">
        <img alt="Market chess strategy" className="sticky top-20 block h-auto max-h-[50vh] w-full max-w-[480px] object-contain object-bottom md:max-h-none" loading="lazy" src="/images/reppl-market-position.webp" />
      </div>
      <div className="p-6 md:p-20">
        <div className="reppl-card market-shadow relative overflow-hidden p-4">
          <div className="flex justify-between border-b border-[#0A0A0A] pb-3 font-mono text-xs">
            <span>[MARKET POSITION]</span><span>[SIGNAL MAP]</span>
          </div>
          <p className="mt-5 font-mono text-xs tracking-[0.18em]">MARKET POSITION OVERVIEW</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse font-mono text-[10px] uppercase">
              <thead>
                <tr>
                  {["PRODUCT CATEGORY ▼", "YOU", "COMP A", "COMP B", "COMP C", "COMP D", "COMP E"].map((h) => (
                    <th key={h} className={`border border-[#0A0A0A] p-2 text-left ${h === "YOU" ? "bg-[#0A0A0A] text-[#F5F4EF]" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {marketRows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, index) => <td key={index} className="border border-[#0A0A0A] p-2">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 whitespace-pre-line font-mono text-[10px] text-[#7A7A7A]">DATA UPDATES EVERY 12 HOURS.{"\n"}POWERED BY REPPL AGENTS.</p>
        </div>
      </div>
    </section>
  );
}

const marketRows = [
  ["TOTAL MARKET", "28.6", "—", "●", "—", "●", "●"],
  ["ONLINE SALES", "32.4", "●", "—", "●", "—", "—"],
  ["CONVERSION RATE", "3.7", "—", "—", "—", "—", "●"],
  ["CUSTOMER ACQ. COST", "24.1", "—", "●", "—", "—", "—"],
  ["RETURN RATE", "8.3", "—", "—", "●", "—", "●"],
  ["REPEAT PURCHASE RATE", "41.8", "●", "—", "—", "●", "—"],
  ["CUSTOMER LTV", "127.6", "—", "●", "—", "—", "●"],
  ["BRAND AWARENESS", "68.2", "●", "—", "—", "●", "—"],
  ["SEARCH RANKING", "2.1", "—", "—", "●", "—", "●"],
  ["PRICE INDEX", "96", "—", "●", "—", "—", "—"],
  ["INVENTORY TURNOVER", "5.8", "●", "—", "●", "—", "—"],
  ["FULFILLMENT SCORE", "91.3", "—", "—", "—", "●", "—"],
  ["CUSTOMER SATISFACTION", "84.7", "—", "●", "—", "—", "●"],
  ["MARKET GROWTH RATE", "12.4", "—", "●", "●", "—", "—"],
];

function HowItWorks() {
  return (
    <section className="landing-reveal border-b border-[#0A0A0A] px-6 py-20 md:px-20 md:py-[120px]">
      <SectionTitle title={"THREE STEPS.\nONE DECISION."} body={"No dashboards. No guesswork.\nNo noise."} />
      <div className="mx-auto mt-16 grid max-w-[1200px] md:grid-cols-3">
        <Step label="01 >>>" title={"AGENTS\nDEPLOY"} tags={["AUTONOMOUS", "STEALTH"]}>Every night, Reppl agents navigate competitor stores like real customers. Prices. Bundles. Ads. Reviews. Stock. We go where scrapers can't.</Step>
        <Step label="02 >>>" title={"SIGNALS\nDETECTED"} tags={["AUTO-DETECTION", "12HR CYCLE"]}>Changes compared against yesterday. Price drops. New offers. Stock gaps. Every competitor move captured, classified, and ranked by impact.</Step>
        <Step label="03 >>>" title={"DECISION\nDELIVERED"} tags={["SLACK", "EMAIL", "60 SECONDS"]}>One brief. One issue. One move. Arrives at 09:00 every morning via Slack or email. Read it in 60 seconds. Act on it.</Step>
      </div>
    </section>
  );
}

function Step({ label, title, tags, children }: { label: string; title: string; tags: string[]; children: ReactNode }) {
  return (
    <div className="border-b border-[#0A0A0A] p-6 md:border-b-0 md:border-r md:last:border-r-0">
      <p className="font-mono text-xs text-[#7A7A7A]">{label}</p>
      <pre className="mt-5 font-display text-4xl leading-none">{title}</pre>
      <p className="mt-5 font-mono text-[13px] leading-7">{children}</p>
      <div className="mt-6 flex flex-wrap gap-2">{tags.map((t) => <span key={t} className="border border-[#0A0A0A] px-2 py-1 font-mono text-[10px]">[{t}]</span>)}</div>
    </div>
  );
}

function SocialProof() {
  const quotes = [
    ["Grooming // D2C", "Caught a competitor flash sale Friday evening. Launched our own by 8PM. Did INR 2.8L that weekend.", "MISSION SUCCESS ✦"],
    ["Skincare // D2C", "I used to spend Sunday evenings checking 5 competitor websites. Now I spend 60 seconds reading my Reppl brief.", "4 HRS SAVED WEEKLY ✦"],
    ["Supplements // D2C", "The stock gap alert paid for 12 months of Reppl in one weekend. Competitor went out of stock. We captured their demand.", "12X ROI IN 48 HOURS ✦"],
  ];
  return (
    <section className="landing-reveal border-b border-[#0A0A0A] px-6 py-20 md:px-20 md:py-[100px]">
      <p className="text-center font-mono text-xs text-[#7A7A7A]">FIELD REPORTS FROM ACTIVE OPERATORS</p>
      <div className="mx-auto mt-12 grid max-w-[1200px] md:grid-cols-3">
        {quotes.map(([sector, quote, outcome]) => (
          <div key={sector} className="reppl-card p-6 font-mono text-xs leading-6">
            <p>OPERATOR: [REDACTED]</p>
            <p>SECTOR: {sector}</p>
            <Divider />
            <p>"{quote}"</p>
            <Divider />
            <p>OUTCOME: {outcome}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="landing-reveal border-b border-[#0A0A0A] px-6 py-20 md:px-20 md:py-[100px]">
      <SectionTitle title={"LESS THAN ONE HOUR\nOF A CONSULTANT."} body={"No free plan. Built for operators\nwho are serious."} />
      <div className="mx-auto mt-14 grid max-w-[960px] md:grid-cols-2">
        <Price title="[STANDARD ACCESS]" price="INR 2,999" features={["Up to 10 competitors tracked", "Daily brief at 09:00", "Slack + Email delivery", "AI discoverability score", "Market signals feed"]} />
        <Price title="[COMMAND ACCESS]  [RECOMMENDED]" price="$99" strong features={["Everything in Standard", "Decision engine full access", "Competitor revenue intel", "AI product action layer", "Signal distribution control"]} />
      </div>
      <p className="mt-8 text-center font-mono text-[10px] text-[#7A7A7A]">NO FREE TIER // NO EXCEPTIONS // BUILT FOR OPERATORS WHO ARE SERIOUS</p>
    </section>
  );
}

function Price({ title, price, features, strong = false }: { title: string; price: string; features: string[]; strong?: boolean }) {
  return (
    <div className={`p-6 font-mono text-xs leading-7 ${strong ? "border-2 border-[#0A0A0A]" : "border border-[#0A0A0A]"}`}>
      <p>{title}</p>
      <p className="mt-8 font-display text-[52px] leading-none">{price}</p>
      <p>/MONTH</p>
      <Divider />
      {features.map((f) => <p key={f}>◆ {f}</p>)}
      <Divider />
      <p>14-DAY FREE TRIAL</p>
      <p>NO CREDIT CARD REQUIRED</p>
      <button className="reppl-btn-dark mt-6 w-full" type="button">[START FREE TRIAL &gt;&gt;&gt;]</button>
    </div>
  );
}

function FinalCta({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-6 py-20 text-center text-[#F5F4EF] md:px-20">
      <div className="w-full max-w-5xl">
        <h2 className="font-display text-[56px] uppercase leading-[0.9] md:text-[clamp(80px,10vw,140px)]">YOUR COMPETITORS<br />MADE MOVES<br />LAST NIGHT.</h2>
        <p className="mt-8 font-mono text-base">REPPL KNOWS WHAT THEY DID.</p>
        <form className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 md:flex-row" onSubmit={onSubmit}>
          <input className="flex-1 border border-[#F5F4EF] bg-transparent px-4 py-3 font-mono text-[13px] text-[#F5F4EF] outline-none placeholder:text-[#7A7A7A]" placeholder="YOUR PRODUCT URL" />
          <button className="reppl-btn-light" type="submit">[DEPLOY REPPL &gt;&gt;&gt;]</button>
        </form>
        <p className="mt-6 font-mono text-[10px] leading-5 text-[#7A7A7A]">14-DAY FREE TRIAL // NO CREDIT CARD // FIRST BRIEF: TOMORROW 09:00 HRS</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-6 py-8 md:px-20">
      <div className="flex flex-col gap-6 border-b border-[#0A0A0A] pb-6 font-mono text-xs md:flex-row md:items-center md:justify-between">
        <div><strong>REPPL</strong><br /><span className="text-[#7A7A7A]">INTELLIGENCE SYSTEM // EST. 2026</span></div>
        <div className="flex gap-5"><a>[TERMS]</a><a>[PRIVACY]</a><a>[CONTACT]</a></div>
        <div>SIGNAL STATUS: ACTIVE ✦<span className="blink">_</span></div>
      </div>
      <p className="mt-6 text-center font-mono text-[10px] text-[#7A7A7A]">Stop finding out too late.</p>
    </footer>
  );
}

function SectionTitle({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center">
      <pre className="font-display text-[56px] leading-none md:text-[64px]">{title}</pre>
      <p className="mt-5 whitespace-pre-line font-mono text-sm leading-7 text-[#7A7A7A]">{body}</p>
    </div>
  );
}
