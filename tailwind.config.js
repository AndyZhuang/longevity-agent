/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          0: "#050510",
          1: "#0a0a1a",
          2: "#10102a",
          3: "#1a1a3a",
        },
        cyan: {
          glow: "#00d4ff",
          soft: "#5eead4",
        },
        violet: {
          glow: "#a78bfa",
          soft: "#c4b5fd",
        },
        gold: {
          glow: "#fbbf24",
          soft: "#fde68a",
        },
        ink: {
          high: "#fafafa",
          mid: "#e2e8f0",
          low: "#94a3b8",
          dim: "#64748b",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "spin-slow": "spin 30s linear infinite",
        "spin-slower": "spin 60s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "tick": "tick 1s steps(60) infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", filter: "blur(8px)" },
          "50%": { opacity: "1", filter: "blur(0px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        tick: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
          "100%": { transform: "scale(1)" },
        },
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(180deg, rgba(10,10,26,0) 0%, rgba(10,10,26,0.95) 80%, rgba(10,10,26,1) 100%)",
        "radial-glow":
          "radial-gradient(circle at center, rgba(0,212,255,0.15) 0%, rgba(0,212,255,0) 60%)",
        "shimmer-text":
          "linear-gradient(90deg, #94a3b8 0%, #fafafa 25%, #5eead4 50%, #fafafa 75%, #94a3b8 100%)",
      },
    },
  },
  plugins: [],
};
