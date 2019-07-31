import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonLabel,
  IonRow,
} from '@ionic/react';
import { Form, Formik } from 'formik';
import gql from 'graphql-tag';
import { History } from 'history';
import { add, logIn } from 'ionicons/icons';
import * as React from 'react';
import { Mutation } from 'react-apollo';
import { Redirect, RouteComponentProps } from 'react-router';
import * as yup from 'yup';
import { Email, Error, IonButtonLink } from '../../components';
import { IMutation } from '../../schema.gql';
import { UserConsumer } from '../../state';

const RESEND_EMAIL = gql`
  mutation ResendEmail($binId: String, $email: String) {
    resendEmail(binId: $binId, email: $email)
  }
`;

class ResendEmail extends React.PureComponent<{ binId: string }> {
  render() {
    return (
      <Mutation<IMutation>
        mutation={RESEND_EMAIL}
        variables={{ binId: this.props.binId }}
      >
        {(mutate, { loading, error }) => {
          if (error) {
            return <Error value={error} />;
          }

          return (
            <IonButton onClick={() => mutate()} color="primary">
              Click here to resend email.
            </IonButton>
          );
        }}
      </Mutation>
    );
  }
}

const emailSchema = yup.object().shape({
  email: yup
    .string()
    .required()
    .email()
    .test(
      'edu',
      'Must be student email',
      value => !!value && value.endsWith('.edu'),
    ),
});

class ConfirmEmail extends React.Component<{
  history: History;
}> {
  render() {
    return (
      <Mutation<IMutation> mutation={RESEND_EMAIL}>
        {(mutate, { loading, data, error }) => {
          if (data && data.resendEmail) {
            return <Redirect to={`/join/confirm/${data.resendEmail}`} />;
          }

          return (
            <Formik<{ email: string }>
              onSubmit={({ email }) => mutate({ variables: { email } })}
              validationSchema={emailSchema}
              initialValues={{ email: '' }}
            >
              {({ touched, errors }) => {
                if (loading) {
                  return <div>Loading...</div>;
                }

                return (
                  <Form>
                    <Email
                      name="email"
                      label="Email"
                      touched={touched}
                      errors={errors}
                    />

                    {error
                      ? error.graphQLErrors.map(err => {
                          if (err.message === 'WRONG_CREDENTIALS') {
                            return (
                              <div className="field" key={err.message}>
                                <p className="help is-danger">
                                  Email is not registered.
                                  <IonButtonLink href="/join/signup">
                                    <IonIcon slot="start" icon={add} />
                                    <IonLabel>Join Instead</IonLabel>
                                  </IonButtonLink>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        })
                      : null}

                    <IonButton color="primary" type="submit">
                      <IonIcon slot="start" icon={logIn} />
                      <span>Send Email</span>
                    </IonButton>
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

export class Confirm extends React.PureComponent<
  RouteComponentProps<{ binId?: string }>
> {
  render() {
    return (
      <IonGrid>
        <IonRow>
          <IonCol sizeSm="4" offsetSm="4">
            <UserConsumer>
              {({ me }) => {
                if (me) {
                  return <Redirect to="/" />;
                }

                if (!this.props.match.params.binId) {
                  return <ConfirmEmail history={this.props.history} />;
                }

                return (
                  <>
                    <p className="is-size-5">
                      An email has been sent to your email. Please click the
                      link to confirm and continue to your account.
                    </p>
                    <p className="is-size-5">
                      <ResendEmail binId={this.props.match.params.binId} />
                    </p>
                  </>
                );
              }}
            </UserConsumer>
          </IonCol>
        </IonRow>
      </IonGrid>
    );
  }
}
