// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // or 'media' if you prefer OS setting
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'], // Default sans-serif
        heading: ['var(--font-lexend)', 'sans-serif'], // For headings
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: { // You can define custom shades for your gradient here if needed
        brand: { // Example of custom brand colors
          purple: '#8B5CF6', // Tailwind purple-500
          pink: '#EC4899',   // Tailwind pink-500
        }
      }
    },
  },
  plugins: [],
}
export default config