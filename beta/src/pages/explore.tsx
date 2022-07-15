import { useQuery } from '../apollo/client';
import { makeApolloSSR } from '../apollo/ssr';
import { withApollo } from '../apollo/with-apollo';
import { Book, BookPreviews, BookWrapper } from '../components/book-preview';
import { Layout } from '../components/layout';
import { Top_ListingsDocument as TOP_LISTINGS } from '../queries';

function Explore() {
  const res = useQuery(TOP_LISTINGS);

  if (res.error) {
    return (
      <Layout title="Explore">
        <BookPreviews>Something went wrong</BookPreviews>
      </Layout>
    );
  }

  if (res.loading) {
    return <Layout title="Explore" />;
  }

  return (
    <Layout title="Explore">
      <BookPreviews>
        {res.data.top.items.map(listing => (
          <BookWrapper key={listing.id}>
            <Book listing={listing} book={listing.book} />
          </BookWrapper>
        ))}
      </BookPreviews>
    </Layout>
  );
}

export default withApollo(Explore);
export const getServerSideProps = makeApolloSSR(Explore);
