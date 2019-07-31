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
import { join } from 'path';
import * as React from 'react';
import { Mutation, MutationFn } from 'react-apollo';
import { Redirect, RouteComponentProps } from 'react-router';
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

class RegisterForm extends React.Component<RouteComponentProps<never>> {
  onSubmit = (mutate: MutationFn<IMutation>) => ({ email, password }) =>
    mutate({
      variables: { email, password },
    });

  render() {
    return (
      <Mutation<IMutation> mutation={REGISTER}>
        {(mutate, { loading, error, data }) => {
          const duplicateUserError =
            error &&
            error.graphQLErrors.find(err => err.message === 'DUPLICATE_USER');

          return (
            <Formik<FormSchema>
              onSubmit={this.onSubmit(mutate)}
              validationSchema={schema}
              initialValues={{
                email: '',
                password: '',
              }}
            >
              {({ touched, errors }) => {
                if (data && data.register) {
                  return (
                    <Redirect
                      to={join(
                        this.props.match.url,
                        '../confirm',
                        data.register,
                      )}
                    />
                  );
                }

                return (
                  <Form>
                    <IonGrid>
                      <IonRow>
                        <IonCol>
                          <Email
                            name="email"
                            label="Email"
                            touched={touched}
                            errors={errors}
                          />
                          <Password
                            name="password"
                            label="Passphrase"
                            touched={touched}
                            errors={errors}
                          />
                        </IonCol>
                      </IonRow>

                      {duplicateUserError ? (
                        <p className="help is-danger">
                          User already exists. <Link to="/login">Login?</Link>
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

                          <IonButton
                            color="primary"
                            expand="block"
                            type="submit"
                          >
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
        }}
      </Mutation>
    );
  }
}

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
