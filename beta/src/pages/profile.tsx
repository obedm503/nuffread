import { useQuery } from '../apollo/client';
import { makeApolloSSR } from '../apollo/ssr';
import { withApollo } from '../apollo/with-apollo';
import { Book, BookPreviews } from '../components/book-preview';
import { Layout } from '../components/layout';
import { My_ListingsDocument as MY_LISTINGS } from '../queries';

function Profile() {
  const res = useQuery(MY_LISTINGS);
  const listings =
    res.data?.me?.__typename === 'User' ? res.data.me.listings : undefined;

  if (res.loading) {
    return null;
  }

  if (res.error) {
    return (
      <Layout title="Profile">
        <BookPreviews>Something went wrong</BookPreviews>
      </Layout>
    );
  }

  return (
    <Layout title="Profile">
      <BookPreviews>
        {listings?.map(listing => (
          <div key={listing.id} className="md:w-52 md:p-3">
            <Book listing={listing} />
          </div>
        ))}
      </BookPreviews>
    </Layout>
  );
}

export default withApollo(Profile);
export const getServerSideProps = makeApolloSSR(Profile);
