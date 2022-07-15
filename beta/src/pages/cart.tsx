import { useQuery } from '../apollo/client';
import { makeApolloSSR } from '../apollo/ssr';
import { withApollo } from '../apollo/with-apollo';
import { Book, BookPreviews, BookWrapper } from '../components/book-preview';
import { Layout } from '../components/layout';
import { Get_Saved_ListingsDocument as GET_SAVED_LISTINGS } from '../queries';

function Cart() {
  const res = useQuery(GET_SAVED_LISTINGS, { variables: { offset: 0 } });

  if (res.loading) {
    return null;
  }

  if (res.error || !res.data.me || res.data.me.__typename === 'Admin') {
    return (
      <Layout title="Cart">
        <BookPreviews>Something went wrong</BookPreviews>
      </Layout>
    );
  }

  return (
    <Layout title="Cart">
      <BookPreviews>
        {res.data.me.saved.items.map(listing => (
          <BookWrapper key={listing.id}>
            <Book listing={listing} book={listing.book} />
          </BookWrapper>
        ))}
      </BookPreviews>
    </Layout>
  );
}

export default withApollo(Cart);
export const getServerSideProps = makeApolloSSR(Cart);
