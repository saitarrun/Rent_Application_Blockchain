/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./node_modules/@shadcn/ui/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px"
      }
    },
    extend: {
      colors: {
        background: "#0B0F14",
        surface: "#121826",
        primary: "#6EE7F9",
        accent: "#A78BFA",
        success: "#34D399",
        warn: "#F59E0B",
        error: "#EF4444",
        border: "#1E293B"
      },
      borderRadius: {
        "2xl": "1.5rem"
      },
      boxShadow: {
        soft: "0 20px 40px rgba(12, 18, 28, 0.35)"
      },
      fontFamily: {
        display: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"]
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-in-out both"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
