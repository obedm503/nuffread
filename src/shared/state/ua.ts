import { createContext } from 'react';

const { Provider, Consumer } = createContext<string>('');

export { Provider as UAProvider, Consumer as UAConsumer };

export const getTheme = (ua: string) => {
  let theme = 'md';
  if (ua && ua.includes('Mac')) {
    theme = 'ios';
  }
  return theme;
};
