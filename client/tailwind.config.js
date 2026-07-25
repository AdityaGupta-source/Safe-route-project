/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // Breakpoints mirror the original max-width media queries (360 / 480 / 768 / 1024)
    // expressed mobile-first, so every legacy rule maps 1:1 onto a Tailwind prefix.
    screens: {
      xs: '361px',
      sm: '481px',
      md: '769px',
      lg: '1025px',
      xl: '1280px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Indigo 600
          dark: '#4338CA',
        },
        secondary: '#10B981', // Emerald 500 - Safe
        danger: '#EF4444', // Red 500 - Hazard
        warning: '#F59E0B', // Amber 500 - Caution
        dark: '#111827', // Gray 900
        light: '#F9FAFB', // Gray 50
        muted: '#6B7280', // Gray 500
        star: '#fbbf24',
        info: '#3b82f6',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top right, #1e1b4b, #111827)',
        'sos-glow': 'radial-gradient(circle at top right, #3f1010, #111827)',
        'heading-fade': 'linear-gradient(to right, #fff, #a5b4fc)',
        'subtitle-fade': 'linear-gradient(to right, #fff, #94a3b8)',
        'save-route': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        primary: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
        save: '0 4px 15px rgba(16, 185, 129, 0.3)',
        'save-hover': '0 6px 20px rgba(16, 185, 129, 0.4)',
        toast: '0 8px 32px rgba(0, 0, 0, 0.4)',
        modal: '0 20px 60px rgba(0, 0, 0, 0.6)',
        popup: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        'toast-in': {
          from: { opacity: '0', transform: 'translateX(400px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'toast-out': {
          from: { opacity: '1', transform: 'translateX(0)' },
          to: { opacity: '0', transform: 'translateX(400px)' },
        },
        'sos-pulse': {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
          '70%': { transform: 'scale(1.1)', boxShadow: '0 0 0 20px rgba(239, 68, 68, 0)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
        },
      },
      animation: {
        'toast-in': 'toast-in 0.4s ease forwards',
        'toast-out': 'toast-out 0.4s ease forwards',
        'sos-pulse': 'sos-pulse 2s infinite',
      },
    },
  },
  plugins: [],
};
