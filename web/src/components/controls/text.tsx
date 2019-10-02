import { Components } from '@ionic/core';
import { IonInput } from '@ionic/react';
import { Field, FieldProps } from 'formik';
import * as React from 'react';
import { Control, ControlProps } from './control';

type Props = ControlProps & Partial<Components.IonInput>;

export const Text: React.FC<Props> = ({
  children,
  type = 'text',
  error,
  label,
  name,
  ...inputProps
}) => {
  const controlProps: ControlProps = { error, label, name };
  return (
    <Field
      name={name}
      render={({ field, form }: FieldProps) => {
        return (
          <Control {...controlProps} form={form}>
            <IonInput
              {...inputProps}
              type={type}
              value={field.value}
              name={field.name}
              onIonBlur={field.onBlur}
              onIonChange={field.onChange}
            />
          </Control>
        );
      }}
    />
  );
};
