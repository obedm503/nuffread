import { useQuery } from '../apollo/client';
import { makeApolloSSR } from '../apollo/ssr';
import { withApollo } from '../apollo/with-apollo';
import { Book, BookPreviews } from '../components/book-preview';
import { Layout } from '../components/layout';
import { Top_ListingsDocument as TOP_LISTINGS } from '../queries';

function Explore() {
  const res = useQuery(TOP_LISTINGS);

  if (res.loading) {
    return null;
  }

  if (res.error) {
    return (
      <Layout title="Explore">
        <BookPreviews>Something went wrong</BookPreviews>
      </Layout>
    );
  }

  return (
    <Layout title="Explore">
      <BookPreviews>
        {res.data.top.items.map(listing => (
          <div key={listing.id} className="md:w-52 md:p-3">
            <Book listing={listing} />
          </div>
        ))}
      </BookPreviews>
    </Layout>
  );
}

export default withApollo(Explore);
export const getServerSideProps = makeApolloSSR(Explore);
