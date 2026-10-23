import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#252927",
        "warm-white": "#F7F6F1",
        indigo: {
          DEFAULT: "#635BCE",
          50: "#E9E8FC",
          100: "#DDD9F9",
          200: "#C5BFF3",
          500: "#746DD6",
          600: "#635BCE",
          700: "#524AB8",
          800: "#433C9E",
          900: "#352F80",
        },
        "soft-indigo": "#E9E8FC",
        brand: {
          50: "#E9E8FC",
          100: "#DDD9F9",
          200: "#C5BFF3",
          500: "#746DD6",
          600: "#635BCE",
          700: "#635BCE",
          800: "#524AB8",
          900: "#433C9E",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F7F6F1",
          muted: "#EFECE6",
          border: "#E5E4DE",
          borderStrong: "#D5D4CD",
        },
        "text-secondary": "#6F716D",
        disabled: "#A8AAA4",
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        border: "var(--border)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
