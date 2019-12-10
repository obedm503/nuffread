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
import gql from 'graphql-tag';
import { add } from 'ionicons/icons';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { object } from 'yup';
import { Email, IonSubmit, Password } from '../../components';
import { apolloFormErrors } from '../../components/apollo-error';
import { IMutation, IMutationRegisterArgs } from '../../schema.gql';
import { useMutation } from '../../state/apollo';
import { tracker } from '../../state/tracker';
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
const schema = object<FormSchema>().shape({
  email: studentEmailSchema,
  password: strongPasswordSchema,
});

const RegisterSuccess = () => <p>Click the confirmation link in your email.</p>;

const Errors = apolloFormErrors({
  NO_INVITE: (
    <>
      You need an invite first. <Link to="/">Get your invite.</Link>
    </>
  ),
  NO_APPROVED_INVITE: 'Your invite request has not been approved.',
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
const RegisterForm: React.FC = () => {
  const [mutate, { error, data, loading }] = useMutation<IMutationRegisterArgs>(
    REGISTER,
    { onCompleted: onRegister },
  );

  if (data?.register) {
    return <RegisterSuccess />;
  }

  const onSubmit = ({ email, password }) =>
    mutate({ variables: { email, password } });
  return (
    <Formik<FormSchema>
      onSubmit={onSubmit}
      validationSchema={schema}
      initialValues={{
        email: '',
        password: '',
      }}
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
