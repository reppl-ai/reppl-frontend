import Head from "next/head";
import Link from "next/link";

/**
 * Reppl “Screen 1” — alternate entry; homepage remains the primary story at /.
 */
export default function SystemLandingPage() {
  return (
    <>
      <Head>
        <title>REPPL // SYSTEM</title>
        <meta content="The decision layer for D2C brands." name="description" />
      </Head>
      <main className="reppl-shell flex min-h-screen flex-col">
        <header className="reppl-border-solid flex h-12 items-center justify-between border-b border-[#0A0A0A] bg-[#F5F4EF] px-4 md:px-8">
          <div className="font-display text-xl tracking-[0.12em]">✦ REPPL</div>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 text-[0.65rem]">
            <Link className="reppl-border-solid px-2 py-1 font-mono tracking-[0.1em] transition-colors duration-150 ease-in-out hover:bg-[#0A0A0A] hover:text-[#F5F4EF]" href="/login">
              [LOGIN]
            </Link>
            <Link
              className="reppl-border-solid bg-[#0A0A0A] px-2 py-1 font-mono tracking-[0.1em] text-[#F5F4EF] transition-colors duration-150 ease-in-out hover:bg-[#F5F4EF] hover:text-[#0A0A0A]"
              href="/signup"
            >
              [SIGN UP &gt;&gt;&gt;]
            </Link>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="max-w-4xl font-display text-5xl leading-[0.95] text-[#0A0A0A] sm:text-7xl md:text-[80px]">
            WHAT TO DO.
            <br />
            WHO WILL WIN.
          </h1>
          <p className="mt-6 max-w-xl text-sm text-[#7A7A7A] sm:text-base">The decision layer for D2C brands.</p>
          <div className="mt-12 flex w-full max-w-xs flex-col gap-3">
            <Link
              className="reppl-border-solid block bg-[#0A0A0A] py-3 text-center text-xs font-mono tracking-[0.12em] text-[#F5F4EF] transition-colors duration-150 ease-in-out hover:bg-[#F5F4EF] hover:text-[#0A0A0A]"
              href="/onboard"
            >
              [GET STARTED &gt;&gt;&gt;]
            </Link>
            <Link
              className="reppl-border-solid block border border-[#0A0A0A] py-3 text-center text-xs font-mono tracking-[0.12em] text-[#0A0A0A] transition-colors duration-150 ease-in-out hover:bg-[#0A0A0A] hover:text-[#F5F4EF]"
              href="/login"
            >
              [LOGIN]
            </Link>
          </div>
          <p className="mt-16 max-w-md text-[0.6rem] leading-relaxed text-[#7A7A7A] sm:text-xs">
            NO DASHBOARDS. NO GUESSWORK.
            <br />
            ONE DECISION AT A TIME.
          </p>
        </div>
      </main>
    </>
  );
}
