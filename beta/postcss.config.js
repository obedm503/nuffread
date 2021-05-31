const inProd = (...arr) => (process.env.NODE_ENV === 'production' ? arr : []);

module.exports = {
  plugins: ['tailwindcss', ...inProd('autoprefixer'), 'postcss-preset-env'],
};
