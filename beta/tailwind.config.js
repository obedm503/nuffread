// const { colors } = require('tailwindcss/defaultTheme');

module.exports = {
  variants: {
    extend: {
      opacity: ['disabled'],
      pointerEvents: ['disabled'],
      scale: ['group-hover'],
    },
  },
  theme: {
    colors: {
      primary: '#15a0bf',
      secondary: '#2590a8',
      tertiary: '#328293',
      success: '#10dc60',
      warning: '#ffce00',
      danger: '#f04141',
      dark: '#222428',
      medium: '#989aa2',
      light: '#f4f5f8',
      white: '#ffffff',
    },
  },
  purge: ['./src/pages/**/*.tsx', './src/components/**/*.tsx'],
};
