/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F4FA',
          100: '#D9E3F3',
          200: '#B3C7E7',
          300: '#82A3D7',
          400: '#4E7BC5',
          500: '#2A58A8',
          600: '#1D4183',
          700: '#153063',
          800: '#0F2147',
          850: '#0D1A38',
          900: '#0A142D',
          950: '#060C1D',
        },
        gold: {
          50: '#FDFBF7',
          100: '#FAF4E8',
          200: '#F3E4C6',
          300: '#EBD19E',
          400: '#E0BD74',
          500: '#D4AF37',
          600: '#C5A869',
          700: '#A48243',
          800: '#7E6131',
          900: '#523E1E',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'gold-glow': '0 0 20px -3px rgba(212, 175, 55, 0.25)',
        'panel': '0 4px 20px -2px rgba(10, 20, 45, 0.05), 0 2px 6px -1px rgba(10, 20, 45, 0.03)',
      }
    },
  },
  plugins: [],
}
