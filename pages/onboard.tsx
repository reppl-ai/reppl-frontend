import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useMemo, useState } from "react";

import { addCompany } from "../lib/reppl/storage";
import type { RepplCompany, RepplSector, RepplTag } from "../lib/reppl/types";
import { REPPL_SECTORS, REPPL_TAG_OPTIONS } from "../lib/reppl/types";

export default function MissionSetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [sector, setSector] = useState<RepplSector | "">("");
  const [tags, setTags] = useState<RepplTag[]>([]);
  const [d1, setD1] = useState("");
  const [d2, setD2] = useState("");
  const [d3, setD3] = useState("");

  const canSubmit = useMemo(
    () => name.trim() && website.trim() && sector,
    [name, website, sector]
  );

  function toggleTag(t: RepplTag) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || !sector) return;
    const id = `c_${Date.now().toString(36)}`;
    const company: RepplCompany = {
      id,
      name: name.trim(),
      website: website.replace(/^https?:\/\//i, "").replace(/\/$/, ""),
      sector,
      tags: [...tags],
      description: [d1, d2, d3].filter(Boolean).join("\n"),
      lastAnalysisAt: null,
      createdAt: new Date().toISOString(),
    };
    addCompany(company);
    void router.push("/companies");
  }

  return (
    <>
      <Head>
        <title>REPPL // MISSION SETUP</title>
      </Head>
      <main className="reppl-shell flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-[560px]">
          <div className="reppl-card-dashed p-6 md:p-8">
            <p className="text-[0.7rem] font-mono tracking-[0.12em] text-[#7A7A7A]">[MISSION SETUP &gt;&gt;&gt;]</p>
            <p className="mt-1 font-mono text-xs tracking-[0.2em] text-[#0A0A0A]">{'>>>>>>>>>>>>>>>>>>>'}</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <span className="reppl-label">COMPANY NAME</span>
                <input className="reppl-input mt-1.5" value={name} onChange={(ev) => setName(ev.target.value)} required />
              </div>
              <div>
                <span className="reppl-label">WEBSITE</span>
                <input
                  className="reppl-input mt-1.5"
                  placeholder="yoursite.com"
                  value={website}
                  onChange={(ev) => setWebsite(ev.target.value)}
                  required
                />
              </div>
              <div>
                <span className="reppl-label">SECTOR</span>
                <select
                  className="reppl-input reppl-border-solid mt-1.5 appearance-none bg-[#F5F4EF] uppercase"
                  value={sector}
                  onChange={(ev) => setSector((ev.target.value || "") as RepplSector | "")}
                  required
                >
                  <option value="">[SELECT SECTOR ▼]</option>
                  {REPPL_SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="reppl-label">TAGS (OPTIONAL)</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {REPPL_TAG_OPTIONS.map((t) => {
                    const on = tags.includes(t);
                    return (
                      <button
                        key={t}
                        className={
                          on
                            ? "border border-[#0A0A0A] bg-[#0A0A0A] px-2.5 py-1 font-mono text-[0.65rem] text-[#F5F4EF] transition-colors duration-150"
                            : "border border-[#0A0A0A] bg-transparent px-2.5 py-1 font-mono text-[0.65rem] text-[#0A0A0A] transition-colors duration-150 hover:bg-[rgba(10,10,10,0.06)]"
                        }
                        type="button"
                        onClick={() => toggleTag(t)}
                      >
                        [{t}]
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <span className="reppl-label">DESCRIPTION (OPTIONAL)</span>
                <textarea className="reppl-input mt-1.5 min-h-[4.5rem] resize-y" value={d1} onChange={(ev) => setD1(ev.target.value)} />
                <textarea className="reppl-input mt-2 min-h-[4.5rem] resize-y" value={d2} onChange={(ev) => setD2(ev.target.value)} />
                <textarea className="reppl-input mt-2 min-h-[4.5rem] resize-y" value={d3} onChange={(ev) => setD3(ev.target.value)} />
              </div>
              <button
                className="reppl-btn-solid mt-2 w-full"
                type="submit"
                disabled={!canSubmit}
              >
                [ADD COMPANY &gt;&gt;&gt;]
              </button>
            </form>
            <p className="mt-6 text-center font-mono text-[0.65rem] text-[#7A7A7A]">
              <Link className="text-[#0A0A0A] underline" href="/">
                [BACK TO LANDING]
              </Link>{" "}
              // <Link className="text-[#0A0A0A] underline" href="/companies">[COMPANIES]</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
