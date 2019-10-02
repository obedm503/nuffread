import { useMutation } from '@apollo/react-hooks';
import { IonCard, IonCardContent, IonCol, IonGrid, IonRow } from '@ionic/react';
import gql from 'graphql-tag';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { apolloFormErrors } from '../../components/apollo-error';
import { IConfirmOnMutationArguments, IMutation } from '../../schema.gql';
import { useRouter } from '../../state/router';

const Errors = apolloFormErrors({
  NO_INVITE: (
    <>
      You need an invite first. <Link to="/">Request invite?</Link>
    </>
  ),
  NO_APPROVED_INVITE: 'Your invite request has not been approved.',
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
  const [mutate, { error, called }] = useMutation<
    IMutation,
    IConfirmOnMutationArguments
  >(CONFIRM_EMAIL, {
    onCompleted: data => {
      if (data && data.confirm) {
        history.push('/login');
      }
    },
  });

  if (error) {
    return <Errors error={error}></Errors>;
  }

  if (!called) {
    mutate({ variables: { code } });
  }

  return <IonCardContent>Loading...</IonCardContent>;
});

export const Confirm = React.memo<
  RouteComponentProps<{ confirmationCode: string }>
>(({ match: { params: { confirmationCode } } }) => {
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
