import { join, normalize } from 'path';
import * as yup from 'yup';

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
    .map(name => {
      if (!name) {
        return '';
      }
      if (typeof name === 'string') {
        return name;
      }
      return filterKeys(name).join(' ');
    })
    .filter(Boolean)
    .join(' ');

export const emailSchema = yup
  .string()
  .required('Email is required')
  .email('Must be a valid email');
export const studentEmailSchema = emailSchema.test(
  'edu',
  'Must be student email',
  value => !!value && value.endsWith('.edu'),
);
export const passwordSchema = yup.string().required('Passphrase is required');
export const strongPasswordSchema = passwordSchema
  .min(10, 'Must be at least 8 characters long')
  .test('uppercase', 'Must contain at least one uppercase letter', value => {
    return !!value && value.split('').some(char => char === char.toUpperCase());
  })
  .test('lowercase', 'Must contain at least one lowercase letter', value => {
    return !!value && value.split('').some(char => char === char.toLowerCase());
  })
  .test('number', 'Must contain at least one digit', value => {
    return !!value && /\d+/.test(value);
  })
  .test('special', 'Must contain at least one special character', value => {
    return !!value && /[ !@#$%^&*~?<>_+-]+/.test(value);
  });
export function validateStrongPassword(password: string): boolean {
  return strongPasswordSchema.isValidSync(password);
}

export const queryLoading = ({
  called,
  loading,
}: {
  called: boolean;
  loading: boolean;
}) => (!called ? true : loading);
