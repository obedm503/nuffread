import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useQuery } from '../apollo/client';
import { Get_MeDocument as GET_ME } from '../queries';

export function useMe() {
  const { data, error, loading } = useQuery(GET_ME);

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

export function useIsLoggedIn(): boolean {
  const { me, loading } = useMe();

  return loading ? false : !!me;
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

export function withToHome(Children) {
  return () => {
    const router = useRouter();
    const { me, loading } = useMe();
    const hasUser = !!me;

    useEffect(() => {
      if (loading) return;
      if (hasUser) {
        router.push('/');
      }
    }, [loading, hasUser, router]);

    if (loading || hasUser) {
      return null;
    }

    return <Children />;
  };
}
