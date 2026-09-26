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
          blue: '#0058A3',        // IKEA signature blue / Plastir bold blue
          darkBlue: '#003E75',
          navy: '#00254D',
          lightBlue: '#EBF4FC',
          yellow: '#FFDB00',      // IKEA bright highlight yellow
          yellowDark: '#E5C500',
          yellowLight: '#FEF9C3',
          charcoal: '#111827',
          slate: '#374151',
          muted: '#6B7280',
          lightGray: '#F3F4F6',
          bgLight: '#F9FAFB',
          card: '#FFFFFF',
          border: '#E5E7EB',
          green: '#10B981',       // Eco / In-stock badge
          red: '#EF4444',         // Sale / Discount badge
        },
        // Backwards compatibility with MVP Flow components
        mvp: {
          red: '#0058A3',
          darkRed: '#003E75',
          crimson: '#00254D',
          black: '#0F172A',
          dark: '#1E293B',
          card: '#182030',
          cardHover: '#222E42',
          silver: '#F1F5F9',
          muted: '#94A3B8',
          gold: '#FFDB00',
          neonGreen: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Bebas Neue', 'sans-serif'],
      },
      boxShadow: {
        'ikea': '0 4px 20px -2px rgba(0, 88, 163, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.06)',
        'ikea-hover': '0 12px 32px -4px rgba(0, 88, 163, 0.2), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        'card-soft': '0 1px 3px rgba(0,0,0,0.05), 0 10px 25px -5px rgba(0,0,0,0.05)',
        'glow-blue': '0 0 25px -5px rgba(0, 88, 163, 0.4)',
        'glow-yellow': '0 0 25px -5px rgba(255, 219, 0, 0.5)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
