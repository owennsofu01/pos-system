/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Storm Green/Teal — the token override found inline in POS Terminal.dc.html
      // (not the base Industry blue palette in the design bundle's styles.css).
      colors: {
        bg: "#eaeeee",
        surface: "#dee5e5",
        ink: "#0b2230",
        divider: "rgba(11,34,48,0.16)",
        accent: {
          DEFAULT: "#35696f",
          100: "#e8f2f1", 200: "#cfe4e2", 300: "#a9cfcb", 400: "#86c4bf",
          500: "#5a8f92", 600: "#45777c", 700: "#2f5f66", 800: "#1d454e", 900: "#0d2b34"
        },
        accent2: {
          DEFAULT: "#4b7f83",
          100: "#e9f1f2", 200: "#d1e2e3", 300: "#aecdcf", 400: "#8bb9bc",
          500: "#6b9698", 600: "#547f83", 700: "#3d666b", 800: "#274a52", 900: "#142e37"
        },
        neutral: {
          100: "#f2f5f5", 200: "#e3e8e8", 300: "#d3d9d9", 400: "#b4bdbe",
          500: "#95a1a2", 600: "#778486", 700: "#5b686a", 800: "#3f4b4d", 900: "#263034"
        }
      },
      fontFamily: {
        heading: ['"Barlow Condensed"', "system-ui", "sans-serif"],
        body: ["Barlow", "system-ui", "sans-serif"]
      },
      boxShadow: {
        sm: "0 1px 2px rgba(38,48,52,0.16)",
        md: "0 3px 10px rgba(38,48,52,0.18)",
        lg: "0 12px 32px rgba(38,48,52,0.24)"
      }
    }
  },
  plugins: []
};
