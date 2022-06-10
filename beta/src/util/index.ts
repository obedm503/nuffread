import { string } from 'yup';
import { ListingCondition } from '../queries';

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

export const conditionNames: { [key in ListingCondition]: string } = {
  [ListingCondition.New]: 'New',
  [ListingCondition.LikeNew]: 'Used: Like New',
  [ListingCondition.VeryGood]: 'Used: Very Good',
  [ListingCondition.Good]: 'Used: Good',
  [ListingCondition.Acceptable]: 'Used: Acceptable',
};

export const emailSchema = string()
  .required('Email is required')
  .email('Email must be valid')
  .max(255, 'Email is too long');
export const studentEmailSchema = emailSchema.test(
  'edu',
  'Email must be a student email',
  value => !!value && value.endsWith('.edu'),
);
export const passwordSchema = string().required('Passphrase is required');
export const strongPasswordSchema = passwordSchema
  .min(8, 'Passphrase must be at least 8 characters long')
  .max(32, 'Passphrase is too long')
  .test('number', 'Passphrase must contain at least 1 number', value => {
    return !!value && /\d+/.test(value);
  });
export const queryLoading = ({
  called,
  loading,
}: {
  called: boolean;
  loading: boolean;
}) => (!called ? true : loading);
