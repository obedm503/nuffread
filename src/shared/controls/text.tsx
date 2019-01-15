import { Field } from 'formik';
import * as React from 'react';
import { Control, ControlProps } from './control';

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
  const className = type === 'range' ? inputProps.className : 'input';
  return (
    <Control {...controlProps}>
      {color => (
        <Field
          {...inputProps as any}
          className={`${className} ${color}`}
          type={type}
          name={name}
        />
      )}
    </Control>
  );
};
