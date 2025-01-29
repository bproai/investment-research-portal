// client/tailwind.config.js
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: "#2563eb",
            foreground: "#ffffff",
          },
          secondary: {
            DEFAULT: "#64748b",
            foreground: "#ffffff",
          },
        },
      },
    },
    plugins: [],
  }