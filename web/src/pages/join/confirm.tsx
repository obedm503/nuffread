import { IonCard, IonCardContent, IonCol, IonGrid, IonRow } from '@ionic/react';
import gql from 'graphql-tag';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { apolloFormErrors } from '../../components/apollo-error';
import { IMutationConfirmArgs } from '../../schema.gql';
import { useMutation } from '../../state/apollo';
import { useRouter } from '../../state/router';

const Errors = apolloFormErrors({
  NO_INVITE: (
    <>
      You need an invite first. <Link to="/">Get your invite.</Link>
    </>
  ),
  NO_APPROVED_INVITE: 'Your invite has not been approved yet.',
});

const CONFIRM_EMAIL = gql`
  mutation ConfirmEmail($code: String!) {
    confirm(code: $code)
  }
`;
const ConfirmEmail = React.memo<{
  code: string;
}>(({ code }) => {
  const { history } = useRouter();
  const [mutate, { error, called }] = useMutation<IMutationConfirmArgs>(
    CONFIRM_EMAIL,
    {
      onCompleted: data => {
        if (data.confirm) {
          history.push('/login');
        }
      },
    },
  );

  if (error) {
    return <Errors error={error} />;
  }

  if (!called) {
    mutate({ variables: { code } });
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
