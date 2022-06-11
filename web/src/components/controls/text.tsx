import { InputChangeEventDetail } from '@ionic/core';
import { IonInput } from '@ionic/react';
import { Field, useFormikContext } from 'formik';
import * as React from 'react';
import { Control, ControlProps } from './control';

type Props = ControlProps &
  Partial<React.ComponentPropsWithRef<typeof IonInput>>;

const getTarget = (e: CustomEvent): HTMLIonInputElement | null =>
  e.currentTarget as any;

export const Text: React.FC<Props> = React.memo(function Text({
  children,
  type,
  error,
  label,
  name,
  hideError,
  ...inputProps
}) {
  const controlProps: ControlProps = { error, label, name, hideError };
  const { setFieldTouched, setFieldValue, values } = useFormikContext<any>();

  // use custom handlers to use ionic's events
  const onBlur = React.useCallback(
    (e: CustomEvent) => {
      const ionInput = getTarget(e);
      if (!ionInput) {
        return;
      }
      setFieldTouched(name, true);
    },
    [setFieldTouched, name],
  );
  const onChange = React.useCallback(
    async (e: CustomEvent<InputChangeEventDetail>) => {
      const ionInput = getTarget(e);
      if (!ionInput) {
        return;
      }
      const input = await ionInput.getInputElement();
      setFieldValue(name, input.value);
    },
    [setFieldValue, name],
  );

  return (
    <Field name={name}>
      {() => (
        <Control {...controlProps}>
          <IonInput
            {...inputProps}
            type={type || 'text'}
            value={values[name]}
            name={name}
            onIonBlur={onBlur}
            onIonChange={onChange}
          />

          {children}
        </Control>
      )}
    </Field>
  );
});
