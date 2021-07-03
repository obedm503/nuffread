import { gql } from '@apollo/client';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useQuery } from '../../apollo/client';
import { makeApolloSSR } from '../../apollo/ssr';
import { withApollo } from '../../apollo/with-apollo';
import { Layout } from '../../components/layout';
import { BASIC_LISTING } from '../../queries';

const GET_LISTING = gql`
  ${BASIC_LISTING}

  query GetListing($id: ID!) {
    listing(id: $id) {
      id
      book {
        id
      }
    }
  }
`;

function Post() {
  const router = useRouter();
  const listingId = router?.query.id;

  const { loading, data, error } = useQuery(GET_LISTING, {
    variables: { id: listingId },
  });

  const bookId = data?.listing?.book?.id;
  useEffect(() => {
    if (bookId) {
      router.push(`/b/${bookId}`);
    }
  }, [bookId, router]);

  if (loading) {
    return null;
  }

  if (error) {
    console.error(error);
    return (
      <Layout>
        <Head>
          <title>Nuffread</title>
        </Head>

        <div>Something went wrong</div>
      </Layout>
    );
  }

  return null;
}

export default withApollo(Post);
export const getServerSideProps = makeApolloSSR(Post);
