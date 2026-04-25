import { useEffect, useState } from "react";

type Props = { open: boolean; onClose: () => void };

export function ProductIntelligencePanel({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!open) {
      setStep(0);
      return;
    }
  }, [open]);
  if (!open) return null;
  return (
    <aside className="hidden h-[calc(100vh-48px)] w-[320px] shrink-0 border-l border-solid border-[#0A0A0A] bg-[#F5F4EF] md:block" style={{ animation: "repplPanelIn 250ms ease forwards" }}>
      <style>{`@keyframes repplPanelIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
      <div className="flex h-12 items-center justify-between border-b border-[#0A0A0A] px-3">
        <span className="font-mono text-[0.65rem]">[PRODUCT INTELLIGENCE]</span>
        <button className="bg-transparent text-[0.7rem] text-[#0A0A0A]" type="button" onClick={onClose}>
          [✗]
        </button>
      </div>
      <div className="h-[calc(100%-3rem)] overflow-y-auto p-4 text-[0.65rem] leading-relaxed">
        <p className="text-[0.6rem]">MANUFACTURER INFO</p>
        <p className="mt-1 text-[#3A3A3A]">Private label, batch MOQ 500. Lead time 21 days.</p>
        <p className="mt-4 border-t border-dashed border-[#0A0A0A] pt-3 text-[0.6rem]">COST COMPARISON</p>
        <p>Their est. cost: ~$8</p>
        <p>Your target cost: ~$6</p>
        <p className="mt-4 border-t border-dashed border-[#0A0A0A] pt-3 text-[0.6rem]">SUPPLIER DETAILS</p>
        <p className="text-[#3A3A3A]">Verified supplier. Low MOQ. Fastest lane: air freight.</p>
        {step < 2 ? (
          <button
            className="reppl-btn-solid mt-6 w-full"
            type="button"
            onClick={() => {
              setStep(1);
              window.setTimeout(() => setStep(2), 1800);
            }}
          >
            [ADD + GENERATE COPY &gt;&gt;&gt;]
          </button>
        ) : null}
        {step >= 1 ? (
          <ul className="mt-4 space-y-1 font-mono text-[0.6rem]">
            <li>▸ Adding product... {step < 2 ? "[ACTIVE &gt;&gt;&gt;]_" : "Done ✦"}</li>
            <li>▸ Generating copy... {step < 2 ? "[PENDING ···]" : "Done ✦"}</li>
          </ul>
        ) : null}
      </div>
    </aside>
  );
}
