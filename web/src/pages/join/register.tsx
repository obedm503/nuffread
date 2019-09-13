import {
  IonButton,
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
import { useMutation } from 'react-apollo';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import { Email, Password } from '../../components';
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

  const noIntiveError =
    error && error.graphQLErrors.find(err => err.message === 'NO_INVITE');

  const duplicateUserError =
    error && error.graphQLErrors.find(err => err.message === 'DUPLICATE_USER');

  if (data && data.register) {
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

              {noIntiveError ? (
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
                  <input
                    type="submit"
                    style={{
                      position: 'absolute',
                      left: '-9999px',
                      width: '1px',
                      height: '1px',
                    }}
                    tabIndex={-1}
                  />

                  <IonButton color="primary" expand="block" type="submit">
                    <IonIcon slot="start" icon={add} />
                    <IonLabel>Join</IonLabel>
                  </IonButton>
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
        <IonCard>
          <IonCardContent>
            <RegisterForm {...props} />
          </IonCardContent>
        </IonCard>
      </IonCol>
    </IonRow>
  </IonGrid>
);
