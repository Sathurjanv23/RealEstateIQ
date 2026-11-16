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
        // Luxury Obsidian & Charcoal Theme
        charcoal: {
          DEFAULT: '#080A0E',
          surface: '#0D1117',
          card: '#11151F',
          cardHover: '#161C28',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        // RealEstateIQ Sleek Dark Theme matching sample
        background: {
          DEFAULT: '#080A0E',
          darker: '#05070A',
          card: '#0D1118',
          cardHover: '#131924',
          cardBorder: '#1A2332',
          input: '#0A0E15',
        },
        // Luxury Champagne Gold Palette
        gold: {
          DEFAULT: '#D4AF37',
          champagne: '#DFBA73',
          warm: '#C5A880',
          light: '#F8EED9',
          badge: '#F3E5AE',
          muted: '#A88448',
          dark: '#856420',
          glow: 'rgba(212, 175, 55, 0.2)',
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
        slateText: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        // Semantic compatibility colors
        brand: {
          400: '#DFBA73',
          500: '#D4AF37',
          600: '#B8934A',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
      },
      boxShadow: {
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'emerald-glow': '0 0 25px -4px rgba(0, 220, 130, 0.35)',
        'btn-emerald': '0 4px 14px -1px rgba(0, 220, 130, 0.3)',
        'gold-glow': '0 0 25px -2px rgba(212, 175, 55, 0.25)',
        'btn-gold': '0 4px 18px -1px rgba(212, 175, 55, 0.35)',
        'card-luxury': '0 20px 50px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
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
