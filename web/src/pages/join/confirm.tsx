import { useMutation } from '@apollo/react-hooks';
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
import { Redirect, RouteComponentProps } from 'react-router';
import * as yup from 'yup';
import { Email, Error, IonButtonLink } from '../../components';
import { useUser } from '../../state';

const RESEND_EMAIL = gql`
  mutation ResendEmail($binId: String, $email: String) {
    resendEmail(binId: $binId, email: $email)
  }
`;

const ResendEmail = React.memo<{ binId: string }>(({ binId }) => {
  const [mutate, { error }] = useMutation(RESEND_EMAIL);

  if (error) {
    return <Error value={error} />;
  }

  return (
    <IonButton onClick={() => mutate({ variables: { binId } })} color="primary">
      Click here to resend email.
    </IonButton>
  );
});

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

const ConfirmEmail = React.memo<{
  history: History;
}>(() => {
  const [mutate, { loading, data, error }] = useMutation(RESEND_EMAIL);

  if (data && data.resendEmail) {
    return <Redirect to={`/join/${data.resendEmail}`} />;
  }

  return (
    <Formik<{ email: string }>
      onSubmit={({ email }) => mutate({ variables: { email } })}
      validationSchema={emailSchema}
      initialValues={{ email: '' }}
    >
      {() => {
        if (loading) {
          return <div>Loading...</div>;
        }

        return (
          <Form>
            <Email name="email" label="Email" />

            {error
              ? error.graphQLErrors.map(err => {
                  if (err.message === 'WRONG_CREDENTIALS') {
                    return (
                      <div className="field" key={err.message}>
                        <p className="help is-danger">
                          Email is not registered.
                          <IonButtonLink href="/join">
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
});

export const Confirm = React.memo<RouteComponentProps<{ binId?: string }>>(
  ({ match, history }) => {
    const me = useUser();
    if (me) {
      return <Redirect to="/" />;
    }
    return (
      <IonGrid>
        <IonRow>
          <IonCol sizeSm="4" offsetSm="4">
            {match.params.binId ? (
              <>
                <p className="is-size-5">
                  An email has been sent to your email. Please click the link to
                  confirm and continue to your account.
                </p>
                <p className="is-size-5">
                  <ResendEmail binId={match.params.binId} />
                </p>
              </>
            ) : (
              <ConfirmEmail history={history} />
            )}
          </IonCol>
        </IonRow>
      </IonGrid>
    );
  },
);
