import path from "path";
import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: Config = {
  darkMode: "class",
  /**
   * Relative + absolute globs: some runners invoke Tailwind with a cwd that
   * breaks `path.join(__dirname, …)` resolution, which produced an empty
   * `content` array and stripped styles. Keep both forms.
   */
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    path.join(__dirname, "app/**/*.{js,ts,jsx,tsx,mdx}"),
    path.join(__dirname, "components/**/*.{js,ts,jsx,tsx,mdx}"),
    path.join(__dirname, "pages/**/*.{js,ts,jsx,tsx,mdx}"),
  ],
  theme: {
    extend: {
      colors: {
        "on-primary-container": "#00532f",
        "on-primary-fixed-variant": "#00673d",
        "error-container": "#9f0519",
        "outline-variant": "#48474b",
        "inverse-primary": "#006d40",
        "secondary-container": "#7d1be2",
        "tertiary-fixed-dim": "#00ef99",
        "on-primary": "#005c36",
        "inverse-surface": "#fcf8fd",
        "surface-container-low": "#131316",
        primary: "#34fea0",
        secondary: "#b984ff",
        "secondary-dim": "#9742fd",
        "on-tertiary": "#00663e",
        outline: "#767579",
        "tertiary-container": "#00ffa3",
        "surface-container-lowest": "#000000",
        "on-tertiary-fixed": "#00472a",
        "tertiary-fixed": "#00ffa3",
        tertiary: "#b1ffce",
        error: "#ff716c",
        "error-dim": "#d7383b",
        "tertiary-dim": "#00ef99",
        surface: "#0e0e11",
        "inverse-on-surface": "#555458",
        "surface-container-highest": "#25252a",
        "on-tertiary-container": "#005c38",
        "on-background": "#f0edf1",
        "surface-container": "#19191d",
        "primary-fixed-dim": "#0cef93",
        background: "#0e0e11",
        "on-tertiary-fixed-variant": "#00673f",
        "on-surface": "#f0edf1",
        "on-secondary-fixed": "#4a008f",
        "surface-container-high": "#1f1f23",
        "surface-tint": "#34fea0",
        "surface-dim": "#0e0e11",
        "surface-variant": "#25252a",
        "secondary-fixed-dim": "#d6b6ff",
        "on-error-container": "#ffa8a3",
        "on-error": "#490006",
        "surface-bright": "#2c2c30",
        "on-secondary": "#2f005f",
        "primary-container": "#0cef93",
        "on-surface-variant": "#acaaae",
        "on-primary-fixed": "#004828",
        "primary-dim": "#0cef93",
        "primary-fixed": "#34fea0",
        "on-secondary-container": "#faf0ff",
        "secondary-fixed": "#e1c7ff",
        "on-secondary-fixed-variant": "#7000d3",
      },
      fontFamily: {
        headline: ["var(--font-manrope)", "Manrope", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        label: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      typography: {
        m2m: {
          css: {
            "--tw-prose-body": "#acaaae",
            "--tw-prose-headings": "#f0edf1",
            "--tw-prose-bold": "#f0edf1",
            "--tw-prose-counters": "#34fea0",
            "--tw-prose-bullets": "#b984ff",
            "--tw-prose-hr": "rgba(52, 254, 160, 0.25)",
            "--tw-prose-quotes": "#f0edf1",
            "--tw-prose-quote-borders": "rgba(185, 132, 255, 0.4)",
            "--tw-prose-captions": "#acaaae",
            maxWidth: "none",
            color: "#acaaae",
            lineHeight: "1.75",
            h1: {
              fontFamily:
                "var(--font-manrope), Manrope, ui-sans-serif, system-ui, sans-serif",
              fontWeight: "800",
              letterSpacing: "-0.025em",
              color: "#f0edf1",
            },
            h2: {
              fontFamily:
                "var(--font-manrope), Manrope, ui-sans-serif, system-ui, sans-serif",
              fontWeight: "700",
              letterSpacing: "-0.02em",
              color: "#f0edf1",
              marginTop: "0",
            },
            h3: {
              fontFamily:
                "var(--font-manrope), Manrope, ui-sans-serif, system-ui, sans-serif",
              fontWeight: "700",
              color: "#f0edf1",
            },
            p: {
              marginTop: "1em",
              marginBottom: "1em",
            },
            ul: {
              marginTop: "0.75em",
              marginBottom: "0.75em",
            },
            li: {
              marginTop: "0.35em",
              marginBottom: "0.35em",
            },
            strong: {
              color: "#f0edf1",
              fontWeight: "600",
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
