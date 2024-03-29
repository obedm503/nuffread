import { gql } from '@apollo/client';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonIcon,
  IonLabel,
  IonList,
  IonRow,
} from '@ionic/react';
import { Form, Formik } from 'formik';
import { add } from 'ionicons/icons';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { object } from 'yup';
import { apolloFormErrors, Email, IonSubmit, Password } from '../../components';
import { IMutation, IMutationRegisterArgs } from '../../schema.gql';
import { tracker, useMutation } from '../../state';
import { strongPasswordSchema, studentEmailSchema } from '../../util';

const REGISTER = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      id
      email
    }
  }
`;

type FormSchema = { email: string; password: string };
const schema = object().shape({
  email: studentEmailSchema,
  password: strongPasswordSchema,
});

const RegisterSuccess = () => <p>Click the confirmation link in your email.</p>;

const Errors = apolloFormErrors({
  DUPLICATE_USER: (
    <>
      This email is already registered. <Link to="/login">Login?</Link>
    </>
  ),
});

const onRegister = (data: IMutation) => {
  if (!data.register) {
    return;
  }
  tracker.register({ email: data.register.email });
};
const init: FormSchema = {
  email: '',
  password: '',
};
const RegisterForm: React.FC = () => {
  const [mutate, { error, data, loading }] = useMutation<IMutationRegisterArgs>(
    REGISTER,
    { onCompleted: onRegister },
  );

  const onSubmit = React.useCallback(
    ({ email, password }) => mutate({ variables: { email, password } }),
    [mutate],
  );

  if (data?.register) {
    return <RegisterSuccess />;
  }

  return (
    <Formik<FormSchema>
      onSubmit={onSubmit}
      validationSchema={schema}
      initialValues={init}
    >
      <Form>
        <IonList>
          <Email name="email" label="Email" disabled={loading} />
          <Password name="password" label="Passphrase" disabled={loading} />

          <Errors error={error} />
        </IonList>

        <IonGrid>
          <IonRow>
            <IonCol>
              <IonSubmit expand="block" disabled={loading}>
                <IonIcon slot="start" icon={add} />
                <IonLabel>Join</IonLabel>
              </IonSubmit>
            </IonCol>
          </IonRow>
        </IonGrid>
      </Form>
    </Formik>
  );
};

export const Register = props => (
  <IonGrid>
    <IonRow>
      <IonCol sizeMd="6" offsetMd="3" sizeLg="4" offsetLg="4">
        <IonCard color="white">
          <IonCardHeader>
            <IonCardTitle className="ion-text-center">Join</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <RegisterForm {...props} />
          </IonCardContent>
        </IonCard>
      </IonCol>
    </IonRow>
  </IonGrid>
);
