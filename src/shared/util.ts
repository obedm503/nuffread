import { join, normalize } from 'path';

const ensureString = str => (typeof str === 'string' ? str : '');
const removeSlash = (str: string) => {
  let s = ensureString(str);
  return s.endsWith('/') ? s.slice(0, s.length - 1) : s;
};
export const normalizeUrl = (str: (string | undefined)[] | string) => {
  const parts = Array.isArray(str) && str.filter(Boolean).map(ensureString);
  const noSlash = removeSlash(parts ? join(...parts) : ensureString(str));
  if (noSlash === '') {
    return '';
  }
  const normal = normalize(noSlash);
  return normal;
};

export const participantUrl = (token?: string, page?: string) =>
  token ? normalizeUrl(['/s', token, page]) : '/s/:token/:page?';

export type Callable<R, P> =
  | R
  | {
      (props?: P): R;
    };

export const callable = <R, P>(fn?: Callable<R, P>, props?: P) =>
  typeof fn === 'function' ? ((fn as Function)(props) as R) : fn;

const filterKeys = (o: { [key: string]: any }): string[] =>
  Object.keys(o).filter(key => o[key]);

export const classes = (
  ...names: Array<undefined | string | { [key: string]: any }>
) =>
  names
    .filter(Boolean)
    .map(name => {
      if (!name) {
        return;
      }
      if (typeof name === 'string') {
        return name;
      }
      return filterKeys(name).join(' ');
    })
    .join(' ');
