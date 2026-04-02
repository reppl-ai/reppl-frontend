import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        surface: "var(--surface)",
        card: "var(--card)",
        ink: "var(--ink)",
        mid: "var(--ink-mid)",
        muted: "var(--ink-muted)",
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', '"Courier New"', "monospace"],
        display: ['"Bebas Neue"', "Impact", "sans-serif"],
      },
    },
  },
  plugins: []
};

export default config;
