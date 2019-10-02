import { useMutation } from '@apollo/react-hooks';
import {
  IonCard,
  IonCardContent,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
} from '@ionic/react';
import { Form, Formik } from 'formik';
import gql from 'graphql-tag';
import { History } from 'history';
import { add, logIn } from 'ionicons/icons';
import * as React from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import { object } from 'yup';
import { Email, Error, IonButtonLink, IonSubmit } from '../../components';
import { apolloFormErrors } from '../../components/apollo-error';
import { IMutation } from '../../schema.gql';
import { useUser } from '../../state';
import { studentEmailSchema } from '../../util';

const RESEND_EMAIL = gql`
  mutation ResendEmail($binId: String, $email: String) {
    resendEmail(binId: $binId, email: $email)
  }
`;

const ResendEmail = React.memo<{ binId: string }>(({ binId }) => {
  const [mutate, { error }] = useMutation<IMutation>(RESEND_EMAIL);

  if (error) {
    return <Error value={error} />;
  }

  return (
    <IonItem
      button
      onClick={() => mutate({ variables: { binId } })}
      color="primary"
    >
      <IonLabel>Click here to resend email</IonLabel>
    </IonItem>
  );
});

const emailSchema = object().shape({
  email: studentEmailSchema,
});

const Errors = apolloFormErrors({
  WRONG_CREDENTIALS: (
    <>
      Email is not registered.
      <IonButtonLink href="/join">
        <IonIcon slot="start" icon={add} />
        <IonLabel>Join Instead</IonLabel>
      </IonButtonLink>
    </>
  ),
});

const ConfirmEmail = React.memo<{
  history: History;
}>(() => {
  const [mutate, { loading, data, error }] = useMutation<IMutation>(
    RESEND_EMAIL,
  );

  if (loading) {
    return <div>Loading...</div>;
  }
  if (data && data.resendEmail) {
    return <Redirect to={`/join/${data.resendEmail}`} />;
  }

  return (
    <Formik<{ email: string }>
      onSubmit={({ email }) => mutate({ variables: { email } })}
      validationSchema={emailSchema}
      initialValues={{ email: '' }}
    >
      <Form>
        <IonList>
          <Email name="email" label="Email" />

          <Errors error={error}></Errors>
        </IonList>

        <IonSubmit color="primary">
          <IonIcon slot="start" icon={logIn} />
          <span>Send Email</span>
        </IonSubmit>
      </Form>
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
              <IonCard color="white">
                <IonCardContent>
                  An email has been sent to your email. Please click the link to
                  confirm and continue to your account.
                </IonCardContent>

                <ResendEmail binId={match.params.binId} />
              </IonCard>
            ) : (
              <ConfirmEmail history={history} />
            )}
          </IonCol>
        </IonRow>
      </IonGrid>
    );
  },
);
