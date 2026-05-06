/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    fontFamily: {
      grotesk: ["Anton", "sans-serif"],
      condiment: ["Condiment", "cursive"],
      mono: ["monospace"]
    },
    extend: {
      colors: {
        "orbis-bg": "#010828",
        "orbis-cream": "#EFF4FF",
        "orbis-neon": "#6FFF00",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        base: "hsl(var(--background))",
        "card-hover": "hsl(var(--muted))",
        danger: "hsl(var(--destructive))"
      },
      textColor: {
        foreground: "hsl(var(--foreground))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        "card-foreground": "hsl(var(--card-foreground))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        destructive: "hsl(var(--destructive))"
      },
      boxShadow: {
        glow: "0 0 0 1px hsl(var(--ring) / 0.35), 0 12px 40px hsl(var(--foreground) / 0.06)"
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
