import { useMutation } from '@apollo/react-hooks';
import {
  IonCard,
  IonCardContent,
  IonCol,
  IonGrid,
  IonIcon,
  IonLabel,
  IonRow,
} from '@ionic/react';
import { Form, Formik } from 'formik';
import gql from 'graphql-tag';
import { add } from 'ionicons/icons';
import * as React from 'react';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import { Email, IonSubmit, Password } from '../../components';
import { IMutation } from '../../schema.gql';
import { passwordSchema } from '../../util';

const REGISTER = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password)
  }
`;

type FormSchema = { email: string; password: string };
const schema = yup.object<FormSchema>().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email')
    .test(
      'edu',
      'Must be a student email',
      value => !!value && value.endsWith('.edu'),
    ),
  password: passwordSchema,
});

const RegisterSuccess = () => <>Click the confirmation link in your email.</>;

const RegisterForm: React.FC = () => {
  const [mutate, { error, data }] = useMutation<IMutation>(REGISTER);

  if (data && data.register) {
    return <RegisterSuccess />;
  }

  const noInviteError =
    error && error.graphQLErrors.find(err => err.message === 'NO_INVITE');

  const duplicateUserError =
    error && error.graphQLErrors.find(err => err.message === 'DUPLICATE_USER');

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
      {() => {
        return (
          <Form>
            <IonGrid>
              <IonRow>
                <IonCol>
                  <Email name="email" label="Email" />
                  <Password name="password" label="Passphrase" />
                </IonCol>
              </IonRow>

              {noInviteError ? (
                <p className="help is-danger">
                  You need an invite first. <Link to="/">Request invite?</Link>
                </p>
              ) : null}

              {duplicateUserError ? (
                <p className="help is-danger">
                  This email is already registered.{' '}
                  <Link to="/login">Login?</Link>
                </p>
              ) : null}

              <IonRow>
                <IonCol>
                  <IonSubmit color="primary" expand="block">
                    <IonIcon slot="start" icon={add} />
                    <IonLabel>Join</IonLabel>
                  </IonSubmit>
                </IonCol>
              </IonRow>
            </IonGrid>
          </Form>
        );
      }}
    </Formik>
  );
};

export const Register = props => (
  <IonGrid>
    <IonRow>
      <IonCol sizeMd="6" offsetMd="3">
        <IonCard color="white">
          <IonCardContent>
            <RegisterForm {...props} />
          </IonCardContent>
        </IonCard>
      </IonCol>
    </IonRow>
  </IonGrid>
);
