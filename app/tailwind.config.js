/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        base: "#0F0F0F",
        card: "#1A1A1A",
        "card-hover": "#222222",
        border: "#2A2A2A",
        primary: "#FFFFFF",
        muted: "#888888",
        accent: "#14F195",
        "accent-dim": "#0ABF74",
        danger: "#FF4444"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(20, 241, 149, 0.35), 0 12px 40px rgba(20, 241, 149, 0.2)"
      },
      keyframes: {
        "fade-rise": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        "fade-rise": "fade-rise 500ms ease-out forwards",
        shimmer: "shimmer 1.8s linear infinite"
      }
    }
  },
  plugins: []
};
