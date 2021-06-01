import { gql } from '@apollo/client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { IUser } from '../schema.gql';
import { useQuery } from './apollo';

const ME = gql`
  query GetMe {
    me {
      ... on User {
        id
        email
      }
    }
  }
`;

export function useMe(): { me?: IUser; loading: boolean } {
  const { data, error, loading } = useQuery(ME);

  if (error) {
    console.error(error);
    throw error;
  }

  const me = data?.me;
  if (loading || !me) {
    return { loading };
  }

  if (me.__typename !== 'User') {
    throw new Error('not logged in as user');
  }

  return { me, loading };
}

export function withToLogin(Children) {
  return function WithToLogin() {
    const router = useRouter();
    const { me, loading } = useMe();
    const hasUser = !!me;

    useEffect(() => {
      if (loading) return;
      if (!hasUser) {
        router.push('/login');
      }
    }, [loading, hasUser, router]);

    if (loading || !hasUser) {
      return null;
    }

    return <Children />;
  };
}
