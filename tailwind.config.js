/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        plastir: {
          orange: '#F16100',        // Official logo orange (RGB 241, 97, 0)
          orangeDark: '#D45000',
          orangeDeep: '#B34000',
          orangeLight: '#FFF7ED',   // Soft warm light tint
          orangeBorder: '#FED7AA',
          charcoal: '#0F172A',
          slate: '#334155',
          muted: '#64748B',
          lightGray: '#F1F5F9',
          bgLight: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          green: '#10B981',         // Eco / In-stock badge
          red: '#EF4444',
        },
        // Mapped for backwards compatibility with all components
        mvp: {
          red: '#F16100',
          darkRed: '#D45000',
          crimson: '#B34000',
          black: '#FFFFFF',
          dark: '#F8FAFC',
          card: '#FFFFFF',
          cardHover: '#F1F5F9',
          silver: '#334155',
          muted: '#64748B',
          gold: '#F59E0B',
          neonGreen: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Bebas Neue', 'sans-serif'],
      },
      boxShadow: {
        'clean': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'clean-hover': '0 10px 25px -3px rgba(241, 97, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow-orange': '0 0 25px -5px rgba(241, 97, 0, 0.4)',
        'card-soft': '0 2px 10px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
