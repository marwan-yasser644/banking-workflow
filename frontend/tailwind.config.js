export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        card: '0 16px 48px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        surface: '#F8FAFC',
        panel: '#EFF6FF',
        border: '#E2E8F0',
      },
    },
  },
  plugins: [],
};
