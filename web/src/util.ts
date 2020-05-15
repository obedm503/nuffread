import { join, normalize } from 'path';
import * as yup from 'yup';
import {
  IBook,
  IListing,
  IPaginatedBooks,
  IPaginatedListings,
  ListingCondition,
} from './schema.gql';

const ensureString = (str) => (typeof str === 'string' ? str : '');
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
  Object.keys(o).filter((key) => o[key]);
export const classes = (
  ...names: Array<undefined | string | { [key: string]: any }>
) =>
  names
    .map((name) => {
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
  .email('Email must be valid');
export const studentEmailSchema = emailSchema.test(
  'edu',
  'Email must be a student email',
  (value) => !!value && value.endsWith('.edu'),
);
export const passwordSchema = yup.string().required('Passphrase is required');
export const strongPasswordSchema = passwordSchema
  .min(8, 'Passphrase must be at least 8 characters long')
  .test('number', 'Passphrase must contain at least 1 number', (value) => {
    return !!value && /\d+/.test(value);
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

export function paginatedBooks(
  books?: IPaginatedBooks,
): {
  books: readonly IBook[] | undefined;
  currentCount: number;
  totalCount: number;
} {
  return {
    books: books?.items,
    currentCount: books?.items.length || 0,
    totalCount: books?.totalCount || 0,
  };
}
export function paginated(
  listings?: IPaginatedListings,
): {
  listings: readonly IListing[] | undefined;
  currentCount: number;
  totalCount: number;
} {
  return {
    listings: listings?.items,
    currentCount: listings?.items.length || 0,
    totalCount: listings?.totalCount || 0,
  };
}

export const conditionNames: { [key in ListingCondition]: string } = {
  [ListingCondition.New]: 'New',
  [ListingCondition.LikeNew]: 'Used - Like New',
  [ListingCondition.VeryGood]: 'Used - Very Good',
  [ListingCondition.Good]: 'Used - Good',
  [ListingCondition.Acceptable]: 'Used - Acceptable',
};
