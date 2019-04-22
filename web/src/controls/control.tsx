import { IonItem, IonLabel, IonText } from '@ionic/react';
import * as React from 'react';

export type ControlProps = {
  label: React.ReactNode;
  error?: React.ReactNode;
  name: string;
  touched?;
  errors;
  values?;
};

export const Control: React.SFC<ControlProps> = ({
  label,
  error,
  name,
  touched,
  errors,
  children,
}) => {
  const isTouched = !!(touched && touched[name]);
  const showError = isTouched && errors[name];
  const errorMessage = error || (errors[name] ? errors[name] : '');
  return (
    <IonItem
      style={{
        // handle highlight color myself because ionic react doesn't yet
        '--highlight-background': showError
          ? 'var(--ion-color-danger)'
          : isTouched
          ? 'var(--ion-color-success)'
          : '',
      }}
    >
      <IonLabel>{label}</IonLabel>

      {children}

      {showError ? (
        <IonLabel slot="end">
          <IonText color="danger">{errorMessage}</IonText>
        </IonLabel>
      ) : null}
    </IonItem>
  );
};
