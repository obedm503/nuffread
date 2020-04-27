const inProd = (...arr) => (process.env.NODE_ENV === 'production' ? arr : []);

module.exports = {
  plugins: [
    'tailwindcss',
    ...inProd('autoprefixer', [
      '@fullhuman/postcss-purgecss',
      {
        content: [
          './src/pages/**/*.{js,jsx,ts,tsx}',
          './src/components/**/*.{js,jsx,ts,tsx}',
        ],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      },
    ]),
    'postcss-preset-env',
  ],
};
