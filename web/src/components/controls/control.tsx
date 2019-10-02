import { IonItem, IonLabel, IonText } from '@ionic/react';
import { FormikProps } from 'formik';
import * as React from 'react';

export type ControlProps = {
  label: React.ReactNode;
  error?: React.ReactNode;
  name: string;
};

export const Control: React.FC<ControlProps & { form: FormikProps<any> }> = ({
  label,
  error,
  name,
  children,
  form: { touched, errors, submitCount },
}) => {
  const isSubmitted = submitCount > 0;
  const isTouched = isSubmitted && !!(touched && touched[name]);
  const showError = isTouched && errors[name];
  const errorMessage = error || (errors[name] ? errors[name] : '');
  return (
    <>
      <IonItem
        style={{
          '--highlight-height': '2px', // always show highlight
          '--highlight-color-focused': showError
            ? 'var(--ion-color-danger)'
            : isTouched
            ? 'var(--ion-color-success)'
            : '',
        }}
      >
        <IonLabel>{label}</IonLabel>

        {children}
      </IonItem>

      {showError ? (
        <IonItem>
          <IonLabel>
            <IonText color="danger">{errorMessage}</IonText>
          </IonLabel>
        </IonItem>
      ) : null}
    </>
  );
};
