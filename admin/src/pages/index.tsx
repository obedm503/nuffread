import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { makeGetSSP, withGraphQL } from '../apollo-client';
import { withToLogin } from '../util/auth';

const Index = withToLogin(function Index() {
  const router = useRouter();

  useEffect(() => {
    router.push('/users');
  }, [router]);

  return null;
});

export default withGraphQL(Index);
export const getServerSideProps = makeGetSSP(Index);
