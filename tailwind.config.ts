import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#003153",
          green: "#57b31a",
          orange: "#ffaa00",
          cyan: "#5fb0b7",
          gray: "#d5d9d9",
          slateBg: "#c2d2e1",
        }
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
        spartan: ["var(--font-spartan)", "sans-serif"],
      }
    },
  },
  plugins: [],
};

export default config;