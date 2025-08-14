import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#f3ede5",
        beige: "#e7dcd2",
        clay: "#b48b79",
        brownLight: "#c8a18d",
        brownDark: "#4b3a2f",
        peach: "#f5e8e0",
        purpleMain: "#7e6dc5",
        purpleDark: "#5f50a2",
        lavender: "#9b8db5",
      },
   fontFamily: {
  sans: ["'Libertinus Sans'", "sans-serif"],
  poppins: ["Poppins", "sans-serif"], // אם תרצי להשאיר את Poppins
},


    },
  },
  plugins: [],
};

export default config;
