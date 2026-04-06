import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, FormEvent } from "react";

const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Mumbai",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

interface Fields {
  email: string;
  password: string;
  name: string;
  brand_name: string;
  timezone: string;
  brief_time: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
  name?: string;
  brand_name?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>({
    email: "",
    password: "",
    name: "",
    brand_name: "",
    timezone: "Asia/Kolkata",
    brief_time: "09:00",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(key: keyof Fields) {
    return (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFields((p) => ({ ...p, [key]: ev.target.value }));
      if (key in errors) setErrors((p) => ({ ...p, [key]: undefined }));
    };
  }

  function validate() {
    const e: FieldErrors = {};
    if (!fields.email) e.email = "EMAIL REQUIRED";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = "INVALID EMAIL FORMAT";
    if (!fields.password) e.password = "PASSWORD REQUIRED";
    else if (fields.password.length < 8) e.password = "MIN 8 CHARACTERS";
    if (!fields.name.trim()) e.name = "YOUR NAME IS REQUIRED";
    if (!fields.brand_name.trim()) e.brand_name = "BRAND NAME IS REQUIRED";
    if (!TIMEZONES.includes(fields.timezone)) e.email = "INVALID TIMEZONE";
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fields.email,
          password: fields.password,
          name: fields.name,
          brand_name: fields.brand_name,
          timezone: fields.timezone,
          brief_time: /^\d{2}:\d{2}$/.test(fields.brief_time) ? fields.brief_time + ":00" : fields.brief_time,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.detail ?? "SIGNUP FAILED. TRY AGAIN.");
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
        <title>CREATE ACCOUNT // REPPL</title>
      </Head>
      <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
        <header className="border-b border-[var(--ink)] px-4 py-4 md:px-8">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between text-xs uppercase">
            <Link className="font-display text-2xl tracking-[0.08em]" href="/">REPPL</Link>
            <Link className="terminal-link" href="/login">[LOGIN]</Link>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="reveal w-full max-w-md" style={{ animationDelay: "0ms" }}>
            <div className="terminal-panel p-6 md:p-10">
              <div className="terminal-row px-0 pb-5 pt-0">
                <span className="terminal-label">[NEW OPERATOR REGISTRATION]</span>
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
                    value={fields.email}
                    onChange={set("email")}
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
                    value={fields.password}
                    onChange={set("password")}
                    placeholder="MIN 8 CHARACTERS"
                    autoComplete="new-password"
                  />
                  {errors.password && <div className="mt-1 text-xs text-[var(--ink-mid)]">// {errors.password}</div>}
                </label>

                <label className="terminal-field text-xs uppercase">
                  YOUR NAME (FOUNDER)
                  <input
                    className="terminal-input mt-2"
                    type="text"
                    value={fields.name}
                    onChange={set("name")}
                    placeholder="FIRST LAST"
                    autoComplete="name"
                  />
                  {errors.name && <div className="mt-1 text-xs text-[var(--ink-mid)]">// {errors.name}</div>}
                </label>

                <label className="terminal-field text-xs uppercase">
                  BRAND NAME
                  <input
                    className="terminal-input mt-2"
                    type="text"
                    value={fields.brand_name}
                    onChange={set("brand_name")}
                    placeholder="YOUR D2C BRAND"
                    autoComplete="organization"
                  />
                  {errors.brand_name && <div className="mt-1 text-xs text-[var(--ink-mid)]">// {errors.brand_name}</div>}
                </label>

                <div className="border-t border-[var(--ink)] pt-5">
                  <div className="mb-3 text-xs uppercase text-[var(--ink-muted)]">// OPTIONAL — BRIEF DELIVERY SETTINGS</div>

                  <div className="flex flex-col gap-5">
                    <label className="terminal-field text-xs uppercase">
                      TIMEZONE
                      <select
                        className="terminal-input mt-2 appearance-none"
                        value={fields.timezone}
                        onChange={set("timezone")}
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz} value={tz}>{tz.replace(/_/g, " ").toUpperCase()}</option>
                        ))}
                      </select>
                    </label>

                    <label className="terminal-field text-xs uppercase">
                      DAILY BRIEF TIME
                      <input
                        className="terminal-input mt-2"
                        type="time"
                        value={fields.brief_time}
                        onChange={set("brief_time")}
                      />
                    </label>
                  </div>
                </div>

                <button
                  className="terminal-button mt-2 w-full text-xs"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "[REGISTERING...]" : "[CREATE ACCOUNT >>>]"}
                </button>
              </form>

              <div className="mt-8 border-t border-[var(--ink)] pt-5 text-xs uppercase text-[var(--ink-muted)]">
                ALREADY HAVE AN ACCOUNT?{" "}
                <Link className="terminal-link text-[var(--ink)]" href="/login">
                  [LOG IN]
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
