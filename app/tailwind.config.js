/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-teal': '#0D7A62',
        'navy-dark': '#0F2744',
        'mint-bright': '#00C97A',
        'risk-red': '#C84B2F',
        'risk-amber': '#C47D0C',
        'risk-green': '#0D7A62',
        'off-white': '#F8FAFC',
        'ink-dark': '#111827',
      }
    },
  },
  plugins: [],
}
