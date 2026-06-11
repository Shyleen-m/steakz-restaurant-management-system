export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        cinematic: ['"Inter"', 'sans-serif'],
      },
      colors: {
        // Luxury Cinematic Palette
        'luxury-black': '#050505',
        'luxury-charcoal': '#0B0B0B',
        'luxury-panel': '#121212',
        'luxury-gold': '#C5A059',
        'luxury-gold-light': '#E5C78B',
        'luxury-gold-dark': '#8B6F47',
        'luxury-ivory': '#F5F5F5',
        'luxury-ivory-muted': '#A0A0A0',
        
        // Semantic overrides
        background: '#050505',
        surface: '#121212',
        espresso: '#050505',
        text: '#F5F5F5',
        muted: '#A0A0A0',
        gold: '#C5A059',
        'gold-light': '#E5C78B',
        'gold-dark': '#8B6F47',
      },
      boxShadow: {
        'luxury-soft': '0 4px 20px rgba(0, 0, 0, 0.5)',
        'luxury-gold': '0 0 20px rgba(197, 160, 89, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
        'elevation-dark': '0 10px 40px rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'gradient-cinematic': 'radial-gradient(circle at top, #1A1A1A 0%, #050505 100%)',
        'gradient-gold': 'linear-gradient(135deg, #C5A059 0%, #8B6F47 100%)',
        'gradient-dark': 'linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(5,5,5,0.9) 100%)',
      },
      letterSpacing: {
        'cinematic': '0.3em',
        'editorial': '0.1em',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.8s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          from: { boxShadow: '0 0 5px rgba(197, 160, 89, 0.2)' },
          to: { boxShadow: '0 0 20px rgba(197, 160, 89, 0.4)' },
        },
      },
    },
  },
  plugins: [],
};
