import { gql, useApolloClient } from '@apollo/client';
import Router from 'next/router';
import { useCallback } from 'react';
import { useMutation } from '../apollo/client';

const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

export function LogoutButton() {
  const [logOut] = useMutation(LOGOUT);
  const client = useApolloClient();

  const onClick = useCallback(async () => {
    const res = await logOut();
    if (res?.data?.logout) {
      await client.resetStore();
      await Router.push('/login');
    }
  }, [client, logOut]);

  return (
    <button
      onClick={onClick}
      className="text-primary bg-transparent border border-solid border-primary hover:bg-primary hover:text-white active:bg-primary font-bold uppercase text-xs px-2 rounded outline-none focus:outline-none"
      type="button"
      style={{ transition: 'all .15s ease' }}
    >
      Logout
    </button>
  );
}
