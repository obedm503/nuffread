import { IonItem, IonLabel } from '@ionic/react';
import { useFormikContext } from 'formik';
import * as React from 'react';

export const ControlError: React.FC = React.memo(function ControlError({
  children,
}) {
  return (
    <IonItem lines="full">
      <IonLabel color="danger" class="ion-text-wrap">
        {children}
      </IonLabel>
    </IonItem>
  );
});

export type ControlProps = {
  label: React.ReactNode;
  error?: React.ReactNode;
  name: string;
  disabled?: boolean;
  color?: string;
};

export const Control: React.FC<ControlProps> = React.memo(function Control({
  label,
  error,
  name,
  color,
  children,
}) {
  const { touched, errors, submitCount } = useFormikContext<any>();

  const isSubmitted = submitCount > 0;
  const isTouched = isSubmitted && !!(touched && touched[name]);
  const showError = isTouched && errors[name];
  const errorMessage = error || (errors[name] ? errors[name] : '');

  return (
    <>
      <IonItem
        color={color}
        lines="full"
        style={{
          '--highlight-height': '2px', // always show highlight
          '--highlight-color-focused': showError
            ? 'var(--ion-color-danger)'
            : isTouched
            ? 'var(--ion-color-success)'
            : '',
        }}
      >
        <IonLabel position="floating">{label}</IonLabel>

        {children}
      </IonItem>

      {showError ? <ControlError>{errorMessage}</ControlError> : null}
    </>
  );
});
