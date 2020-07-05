import { TextareaChangeEventDetail } from '@ionic/core';
import { IonTextarea } from '@ionic/react';
import { Field, useFormikContext } from 'formik';
import * as React from 'react';
import { Control, ControlProps } from './control';

type Props = ControlProps &
  Partial<React.ComponentPropsWithRef<typeof IonTextarea>>;

const getTarget = (e: CustomEvent): HTMLIonTextareaElement | null =>
  e.currentTarget as any;

export const TextArea: React.FC<Props> = React.memo(function TextArea({
  children,
  error,
  label,
  name,
  color,
  ...inputProps
}) {
  const controlProps: ControlProps = { error, label, name, color };
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
    async (e: CustomEvent<TextareaChangeEventDetail>) => {
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
          <IonTextarea
            {...inputProps}
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
