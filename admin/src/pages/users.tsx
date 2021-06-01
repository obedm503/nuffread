import { gql } from '@apollo/client';
import groupBy from 'lodash/groupBy';
import { FC, useCallback, useEffect, useState } from 'react';
import { makeGetSSP, withGraphQL } from '../apollo-client';
import { Card } from '../components/card';
import { RelativeDate } from '../components/date';
import { Layout } from '../components/layout';
import { Cols, Table } from '../components/table';
import { IMutationResendConfirmEmailArgs, IUser } from '../schema.gql';
import { classes } from '../util';
import { useMutation, useQuery } from '../util/apollo';
import { withToLogin } from '../util/auth';

function useCountdown(secs: number) {
  const [seconds, setSeconds] = useState(secs);
  const [isCountdownActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isCountdownActive) {
      interval = setInterval(() => {
        setSeconds(seconds => {
          const newSecs = seconds - 1;
          if (newSecs < 0) {
            setIsActive(false);
            return secs;
          }
          return newSecs;
        });
      }, 1000);
    } else if (!isCountdownActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isCountdownActive, seconds, secs]);

  return {
    startCountdown: useCallback(() => setIsActive(true), [setIsActive]),
    isCountdownActive,
  };
}

const RESEND_CONFIRMATION_EMAIL = gql`
  mutation ResendConfirmationEmail($email: String!) {
    resendConfirmEmail(email: $email)
  }
`;

const ResendEmail: FC<{ email: string; id: string; refetch }> = ({
  email,
  refetch,
}) => {
  const [resendConfirmation, { loading, error }] = useMutation<
    IMutationResendConfirmEmailArgs
  >(RESEND_CONFIRMATION_EMAIL);

  const { startCountdown, isCountdownActive } = useCountdown(10);

  const onClick = useCallback(async () => {
    await resendConfirmation({ variables: { email } });
    startCountdown();
    await refetch();
  }, [resendConfirmation, refetch, email, startCountdown]);

  if (error) {
    throw error;
  }

  const disabled = loading || isCountdownActive;
  return (
    <button
      disabled={disabled}
      className={classes(
        'bg-transparent hover:bg-primary text-primary font-semibold hover:text-white py-2 px-4 border border-primary hover:border-transparent rounded',
        { 'opacity-50 cursor-not-allowed': disabled },
      )}
      onClick={onClick}
    >
      Resend Confirmation
    </button>
  );
};

const USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      confirmedAt
    }
  }
`;

const cols: Cols<IUser> = [
  { name: 'Name', key: 'name' },
  { name: 'Email', key: 'email' },
  { name: 'Confirmed At', key: u => <RelativeDate date={u.confirmedAt} /> },
];

const notConfirmedCols: Cols<IUser & { refetch }> = [
  ...cols,
  {
    name: 'Resend Email',
    className: 'text-center',
    key: ({ email, id, refetch }) => (
      <ResendEmail email={email} id={id} refetch={refetch} />
    ),
  },
];

const Users = withToLogin(function Users() {
  const { data, refetch } = useQuery(USERS);

  const users = data && data.users;
  const { confirmed, notConfirmed } = users
    ? groupBy(users, user => (user.confirmedAt ? 'confirmed' : 'notConfirmed'))
    : ({} as any);

  return (
    <Layout>
      <Card title="Not Confirmed Users">
        <Table cols={notConfirmedCols} data={notConfirmed} refetch={refetch} />
      </Card>

      <Card title="Confirmed Users">
        <Table cols={cols} data={confirmed} />
      </Card>
    </Layout>
  );
});

export default withGraphQL(Users);
export const getServerSideProps = makeGetSSP(Users);
