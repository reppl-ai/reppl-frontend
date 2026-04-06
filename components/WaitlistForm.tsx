import { useState, FormEvent } from "react";

interface WaitlistFormData {
  email: string;
  companyName: string;
  businessArea: string;
  companySize: string;
  website?: string;
  phone?: string;
}

export default function WaitlistForm() {
  const [formData, setFormData] = useState<WaitlistFormData>({
    email: "",
    companyName: "",
    businessArea: "",
    companySize: "",
    website: "",
    phone: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit. Please try again.");
      }

      setStatus("success");
      setFormData({
        email: "",
        companyName: "",
        businessArea: "",
        companySize: "",
        website: "",
        phone: "",
      });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (status === "success") {
    return (
      <div className="terminal-panel p-6 md:p-10">
        <div className="terminal-label">[TRANSMISSION RECEIVED]</div>
        <div className="mt-6 font-display text-4xl uppercase md:text-5xl">YOU'RE ON THE LIST.</div>
        <div className="mt-6 text-sm uppercase leading-8 text-[var(--ink-mid)]">
          WE'LL NOTIFY YOU WHEN EARLY ACCESS OPENS.
          <br />
          CHECK YOUR EMAIL FOR CONFIRMATION.
        </div>
        <button
          onClick={() => setStatus("idle")}
          className="terminal-button mt-6"
          type="button"
        >
          {"[SUBMIT ANOTHER >>>]"}
        </button>
      </div>
    );
  }

  return (
    <div className="terminal-panel p-6 md:p-10">
      <div className="terminal-label">[EARLY ACCESS REQUEST]</div>
      <div className="mt-6 font-display text-4xl uppercase md:text-5xl">JOIN THE WAITLIST.</div>
      <div className="mt-6 text-sm uppercase leading-8 text-[var(--ink-mid)]">
        BE THE FIRST TO GET DAILY MARKET WARNINGS.
        <br />
        LIMITED EARLY ACCESS SLOTS AVAILABLE.
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Email */}
          <label className="terminal-field">
            <span className="terminal-label">[EMAIL]*</span>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="FOUNDER@COMPANY.COM"
              className="terminal-input"
              disabled={status === "submitting"}
            />
          </label>

          {/* Company Name */}
          <label className="terminal-field">
            <span className="terminal-label">[COMPANY NAME]*</span>
            <input
              type="text"
              name="companyName"
              required
              value={formData.companyName}
              onChange={handleChange}
              placeholder="YOUR COMPANY"
              className="terminal-input"
              disabled={status === "submitting"}
            />
          </label>

          {/* Business Area */}
          <label className="terminal-field">
            <span className="terminal-label">[BUSINESS AREA]*</span>
            <select
              name="businessArea"
              required
              value={formData.businessArea}
              onChange={handleChange}
              className="terminal-input"
              disabled={status === "submitting"}
            >
              <option value="">SELECT CATEGORY</option>
              <option value="beauty">BEAUTY & PERSONAL CARE</option>
              <option value="fashion">FASHION & APPAREL</option>
              <option value="food">FOOD & BEVERAGE</option>
              <option value="health">HEALTH & WELLNESS</option>
              <option value="home">HOME & LIVING</option>
              <option value="electronics">ELECTRONICS</option>
              <option value="sports">SPORTS & FITNESS</option>
              <option value="pet">PET CARE</option>
              <option value="kids">KIDS & BABY</option>
              <option value="other">OTHER</option>
            </select>
          </label>

          {/* Company Size */}
          <label className="terminal-field">
            <span className="terminal-label">[COMPANY SIZE]*</span>
            <select
              name="companySize"
              required
              value={formData.companySize}
              onChange={handleChange}
              className="terminal-input"
              disabled={status === "submitting"}
            >
              <option value="">SELECT SIZE</option>
              <option value="1-10">1-10 EMPLOYEES</option>
              <option value="11-50">11-50 EMPLOYEES</option>
              <option value="51-200">51-200 EMPLOYEES</option>
              <option value="201-500">201-500 EMPLOYEES</option>
              <option value="500+">500+ EMPLOYEES</option>
            </select>
          </label>

          {/* Website (Optional) */}
          <label className="terminal-field">
            <span className="terminal-label">[WEBSITE]</span>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="HTTPS://YOURSITE.COM"
              className="terminal-input"
              disabled={status === "submitting"}
            />
          </label>

          {/* Phone (Optional) */}
          <label className="terminal-field">
            <span className="terminal-label">[PHONE]</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="terminal-input"
              disabled={status === "submitting"}
            />
          </label>
        </div>

        {status === "error" && (
          <div className="border border-red-600 bg-red-50 p-4 text-sm uppercase text-red-600">
            [ERROR] {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="terminal-button"
          >
            {status === "submitting" ? "[SUBMITTING...]" : "[REQUEST ACCESS >>>]"}
          </button>
          <div className="text-xs uppercase text-[var(--ink-muted)] flex items-center">
            * REQUIRED FIELDS
          </div>
        </div>
      </form>
    </div>
  );
}
