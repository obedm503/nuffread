import { Components } from '@ionic/core';
import { IonInput } from '@ionic/react';
import { Field } from 'formik';
import * as React from 'react';
import { Control, ControlProps } from './control';

type Props = ControlProps & Partial<Components.IonInput>;

export const Text: React.FC<Props> = ({
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
      <Field
        name={name}
        render={({ field }) => {
          return (
            <IonInput
              {...inputProps}
              type={type}
              value={field.value}
              name={field.name}
              onIonBlur={field.onBlur}
              onIonChange={field.onChange}
            />
          );
        }}
      />
    </Control>
  );
};
