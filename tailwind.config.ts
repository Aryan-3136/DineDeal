import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2520",
        cream: "#f7f1e6",
        linen: "#fbfaf6",
        leaf: "#1f7a4d",
        amber: "#c77b23",
        mist: "#e7ece5"
      },
      boxShadow: {
        soft: "0 16px 45px rgba(31,37,32,0.08)"
      }
    }
  },
  plugins: []
};

export default config;
