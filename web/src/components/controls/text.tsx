import { InputChangeEventDetail } from '@ionic/core';
import { IonInput } from '@ionic/react';
import { Field, FieldProps } from 'formik';
import * as React from 'react';
import { Control, ControlProps } from './control';

type Props = ControlProps &
  Partial<React.ComponentPropsWithRef<typeof IonInput>>;

const getTarget = (e: CustomEvent): HTMLIonInputElement | null =>
  e.currentTarget as any;

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
        // use custom handlers to use ionic's events
        const onBlur = (e: CustomEvent) => {
          const ionInput = getTarget(e);
          if (!ionInput) {
            return;
          }
          form.setFieldTouched(field.name, true);
        };
        const onChange = async (e: CustomEvent<InputChangeEventDetail>) => {
          const ionInput = getTarget(e);
          if (!ionInput) {
            return;
          }
          const input = await ionInput.getInputElement();
          form.setFieldValue(field.name, input.value);
        };

        return (
          <Control {...controlProps} form={form}>
            <IonInput
              {...inputProps}
              type={type}
              value={field.value}
              name={field.name}
              onIonBlur={onBlur}
              onIonChange={onChange}
            />
          </Control>
        );
      }}
    />
  );
};
