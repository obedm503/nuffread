import { gql, useApolloClient } from '@apollo/client';
import { IonCard, IonCardContent, IonCol, IonGrid, IonRow } from '@ionic/react';
import * as React from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import { apolloFormErrors } from '../../components';
import { IMutationConfirmArgs } from '../../schema.gql';
import { tracker, useMutation } from '../../state';

const Errors = apolloFormErrors({
  WRONG_CREDENTIALS: () => <Redirect to="/" />,
});

const CONFIRM_EMAIL = gql`
  mutation ConfirmEmail($code: String!) {
    confirm(code: $code)
  }
`;
const ConfirmEmail = React.memo<{
  code: string;
}>(({ code }) => {
  const client = useApolloClient();
  const [mutate, { data, error, called }] = useMutation<IMutationConfirmArgs>(
    CONFIRM_EMAIL,
  );

  React.useEffect(() => {
    if (!called) {
      mutate({ variables: { code } }).then(({ data }) => {
        if (data?.confirm) {
          tracker.event('CONFIRM_EMAIL', {});
          return client.resetStore();
        }
      });
    }
  });

  if (data?.confirm) {
    return <Redirect to="/" />;
  }

  if (error) {
    return <Errors error={error} />;
  }

  return <IonCardContent>Loading...</IonCardContent>;
});

export const Confirm = React.memo<
  RouteComponentProps<{ confirmationCode: string }>
>(function Confirm({
  match: {
    params: { confirmationCode },
  },
}) {
  return (
    <IonGrid>
      <IonRow>
        <IonCol sizeSm="4" offsetSm="4">
          <IonCard color="white">
            <ConfirmEmail code={confirmationCode} />
          </IonCard>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
});
