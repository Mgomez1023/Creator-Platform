import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#11212D",
        paper: "#F7F5EF",
        accent: "#E76F51",
        mint: "#3FA796",
        sky: "#5E9EFF",
      },
      boxShadow: {
        card: "0 14px 40px -22px rgba(17, 33, 45, 0.35)",
      },
    },
  },
  plugins: [],
} satisfies Config;
