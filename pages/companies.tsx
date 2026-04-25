import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";

import { addCompany, loadCompanies } from "../lib/reppl/storage";
import type { RepplCompany, RepplSector } from "../lib/reppl/types";
import { REPPL_SECTORS } from "../lib/reppl/types";

export default function CompanySelectionPage() {
  const router = useRouter();
  const [list, setList] = useState<RepplCompany[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [sector, setSector] = useState<RepplSector | "">("");

  useEffect(() => {
    setList(loadCompanies());
  }, []);

  return (
    <>
      <Head>
        <title>REPPL // COMPANIES</title>
      </Head>
      <div className="reppl-shell min-h-screen">
        <header className="flex h-12 items-center justify-between bg-[#0A0A0A] px-4 text-sm text-[#F5F4EF] md:px-6">
          <div className="max-w-[60%] truncate font-mono text-xs tracking-[0.1em] sm:max-w-none">✦ REPPL</div>
          <button
            className="reppl-border-solid border border-[#F5F4EF] bg-transparent px-2 py-1 font-mono text-[0.6rem] text-[#F5F4EF] transition-colors duration-150 hover:bg-[#F5F4EF] hover:text-[#0A0A0A] sm:text-[0.65rem]"
            type="button"
            onClick={() => setModalOpen(true)}
          >
            [+ ADD COMPANY &gt;&gt;&gt;]
          </button>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
          {list.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-mono text-sm tracking-[0.12em]">✦ NO COMPANIES YET</p>
              <p className="mt-3 font-mono text-xs text-[#7A7A7A]">{"..........................................."}</p>
              <p className="mt-4 text-sm text-[#0A0A0A]">Add your first company to begin.</p>
              <button
                className="reppl-border-solid mt-6 inline-block border border-[#0A0A0A] bg-[#0A0A0A] px-4 py-2 font-mono text-xs text-[#F5F4EF] transition-colors hover:bg-[#F5F4EF] hover:text-[#0A0A0A]"
                type="button"
                onClick={() => setModalOpen(true)}
              >
                [+ ADD COMPANY &gt;&gt;&gt;]
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <button
                  key={c.id}
                  className="reppl-card-dashed text-left transition-[border-width] duration-150 hover:border-2 hover:border-solid hover:border-[#0A0A0A]"
                  type="button"
                  onClick={() => {
                    void router.push(`/workspace/${c.id}`);
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-medium tracking-wide">[{c.name.toUpperCase()}]</span>
                      <span className="shrink-0 font-mono text-[0.6rem] text-[#0A0A0A]">[ACTIVE ✦]</span>
                    </div>
                    <p className="mt-2 font-mono text-[0.7rem] text-[#3A3A3A]">{c.website}</p>
                    <div className="my-3 border-t border-dashed border-[#0A0A0A]" />
                    <p className="font-mono text-[0.65rem]">SECTOR: {c.sector}</p>
                    <p className="mt-1 font-mono text-[0.65rem] text-[#5A5A5A]">
                      LAST ANALYSIS: {formatAnalysis(c.lastAnalysisAt)}
                    </p>
                    <div className="mt-4">
                      <span className="reppl-border-solid inline-block w-full border border-[#0A0A0A] py-2 text-center font-mono text-[0.65rem]">
                        [OPEN &gt;&gt;&gt;]
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <p className="mt-10 text-center font-mono text-[0.65rem] text-[#7A7A7A]">
            <Link className="text-[#0A0A0A]" href="/">[LANDING]</Link> //{" "}
            <Link className="text-[#0A0A0A]" href="/system">[SYSTEM]</Link>
          </p>
        </main>
        {modalOpen ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(10,10,10,0.25)] px-4" onClick={() => setModalOpen(false)}>
            <form
              className="mb-8 w-full max-w-[480px] border border-[#0A0A0A] bg-[#F5F4EF] p-6"
              style={{ animation: "companySetupIn 300ms ease forwards" }}
              onClick={(event) => event.stopPropagation()}
              onSubmit={(event: FormEvent) => {
                event.preventDefault();
                if (!name.trim() || !website.trim() || !sector) return;
                const id = `c_${Date.now().toString(36)}`;
                addCompany({
                  id,
                  name: name.trim(),
                  website: website.replace(/^https?:\/\//i, "").replace(/\/$/, ""),
                  sector,
                  tags: [],
                  description: "",
                  lastAnalysisAt: null,
                  createdAt: new Date().toISOString(),
                });
                setModalOpen(false);
                void router.push(`/workspace/${id}`);
              }}
            >
              <style>{`@keyframes companySetupIn{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[0.7rem]">[SETUP NEW COMPANY]</p>
                <button className="bg-transparent font-mono text-[0.7rem]" type="button" onClick={() => setModalOpen(false)}>[✗]</button>
              </div>
              <p className="mt-1 font-mono text-xs tracking-[0.2em]">{">".repeat(18)}</p>
              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="reppl-label">COMPANY NAME</span>
                  <input className="reppl-input mt-1.5" value={name} onChange={(event) => setName(event.target.value)} />
                </label>
                <label className="block">
                  <span className="reppl-label">WEBSITE</span>
                  <input className="reppl-input mt-1.5" value={website} onChange={(event) => setWebsite(event.target.value)} />
                </label>
                <label className="block">
                  <span className="reppl-label">SECTOR</span>
                  <select className="reppl-input mt-1.5 bg-[#F5F4EF]" value={sector} onChange={(event) => setSector((event.target.value || "") as RepplSector | "")}>
                    <option value="">[SELECT ▼]</option>
                    {REPPL_SECTORS.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
              <button className="reppl-btn-solid mt-6" type="submit" disabled={!name.trim() || !website.trim() || !sector}>
                [CREATE COMPANY &gt;&gt;&gt;]
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </>
  );
}

function formatAnalysis(iso: string | null) {
  if (!iso) return "NEVER";
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
  if (diff < 1) return "TODAY";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}
