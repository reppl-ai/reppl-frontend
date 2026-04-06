import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: typeof errors = {};
    if (!email) e.email = "EMAIL REQUIRED";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "INVALID EMAIL FORMAT";
    if (!password) e.password = "PASSWORD REQUIRED";
    return e;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setApiError("");
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.detail ?? "LOGIN FAILED. TRY AGAIN.");
        return;
      }
      if (typeof data.access_token !== "string" || !data.access_token) {
        setApiError("UNEXPECTED SERVER RESPONSE. TRY AGAIN.");
        return;
      }
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch {
      setApiError("NETWORK ERROR. CHECK YOUR CONNECTION.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>LOGIN // REPPL</title>
      </Head>
      <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
        <header className="border-b border-[var(--ink)] px-4 py-4 md:px-8">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between text-xs uppercase">
            <Link className="font-display text-2xl tracking-[0.08em]" href="/">REPPL</Link>
            <Link className="terminal-link" href="/signup">[CREATE ACCOUNT]</Link>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="reveal w-full max-w-md" style={{ animationDelay: "0ms" }}>
            <div className="terminal-panel p-6 md:p-10">
              <div className="terminal-row px-0 pb-5 pt-0">
                <span className="terminal-label">[OPERATOR LOGIN]</span>
                <span className="terminal-label blink">_</span>
              </div>

              {apiError && (
                <div className="mt-4 border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-xs uppercase text-[var(--bg)]">
                  {apiError}
                </div>
              )}

              <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
                <label className="terminal-field text-xs uppercase">
                  EMAIL ADDRESS
                  <input
                    className="terminal-input mt-2"
                    type="email"
                    value={email}
                    onChange={(ev) => { setEmail(ev.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                    placeholder="FOUNDER@BRAND.COM"
                    autoComplete="email"
                  />
                  {errors.email && <div className="mt-1 text-xs text-[var(--ink-mid)]">// {errors.email}</div>}
                </label>

                <label className="terminal-field text-xs uppercase">
                  PASSWORD
                  <input
                    className="terminal-input mt-2"
                    type="password"
                    value={password}
                    onChange={(ev) => { setPassword(ev.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  {errors.password && <div className="mt-1 text-xs text-[var(--ink-mid)]">// {errors.password}</div>}
                </label>

                <button
                  className="terminal-button mt-2 w-full text-xs"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "[AUTHENTICATING...]" : "[LOGIN >>>]"}
                </button>
              </form>

              <div className="mt-8 border-t border-[var(--ink)] pt-5 text-xs uppercase text-[var(--ink-muted)]">
                NO ACCOUNT?{" "}
                <Link className="terminal-link text-[var(--ink)]" href="/signup">
                  [CREATE ONE]
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
