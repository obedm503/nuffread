import { Field } from 'formik';
import * as React from 'react';
import { Control, ControlProps } from './control';
import { classes } from '../util';

type Props = ControlProps &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;

export const Text: React.SFC<Props> = ({
  children,
  type = 'text',
  error,
  errors,
  label,
  name,
  touched,
  ...inputProps
}) => {
  const controlProps: ControlProps = {
    error,
    errors,
    label,
    name,
    touched,
  };
  return (
    <Control {...controlProps}>
      {color => (
        <Field
          {...inputProps as any}
          className={classes(inputProps.className, color, {
            input: type !== 'range',
          })}
          type={type}
          name={name}
        />
      )}
    </Control>
  );
};
