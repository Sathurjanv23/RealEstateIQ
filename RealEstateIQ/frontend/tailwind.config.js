/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // RealEstateIQ Sleek Dark Theme matching sample
        background: {
          DEFAULT: '#061017', // Deep Dark Navy/Pine
          darker: '#040B10',
          card: '#0B1722',   // Sleek Dark Card
          cardHover: '#0E1F2E',
          cardBorder: '#142938',
          input: '#091520',
        },
        // Primary Brand Accent: Mint / Emerald Green
        emerald: {
          DEFAULT: '#00DC82',
          hover: '#00C373',
          dark: '#0B3324',
          light: '#E6FAF2',
          glow: 'rgba(0, 220, 130, 0.15)',
        },
        forest: {
          DEFAULT: '#0A2E20',
          deep: '#061C14',
          banner: '#082E22',
        },
        gold: {
          DEFAULT: '#C9A227',
          light: '#FAF4DC',
          badge: '#F3E5AE',
        },
        slateText: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        // Semantic compatibility colors
        brand: {
          400: '#00DC82',
          500: '#10B981',
          600: '#059669',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'emerald-glow': '0 0 25px -4px rgba(0, 220, 130, 0.35)',
        'btn-emerald': '0 4px 14px -1px rgba(0, 220, 130, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
