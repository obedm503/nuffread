import { Field, Form, Formik } from 'formik';
import { addOutline, searchOutline, reloadOutline } from 'ionicons/icons';
import debounce from 'lodash/debounce';
import { useCallback, useMemo, useState } from 'react';
import NumberFormat from 'react-number-format';
import { useLazyQuery, useMutation, useQuery } from '../apollo/client';
import { makeApolloSSR } from '../apollo/ssr';
import { withApollo } from '../apollo/with-apollo';
import { Book, BookPreviews } from '../components/book-preview';
import { RelativeDate } from '../components/date';
import { Icon } from '../components/icon';
import { Layout } from '../components/layout';
import {
  Create_ListingDocument as CREATE_LISTING,
  Google_BookDocument as GOOGLE_BOOK,
  IBasicListingFragment,
  IGoogleBookFragment,
  ISearchGoogleBookFragment,
  ListingCondition,
  My_ListingsDocument as MY_LISTINGS,
  Search_GoogleDocument as SEARCH_GOOGLE,
} from '../queries';
import { useRouter } from 'next/router';

const conditionNames: { [key in ListingCondition]: string } = {
  [ListingCondition.New]: 'New',
  [ListingCondition.LikeNew]: 'Used - Like New',
  [ListingCondition.VeryGood]: 'Used - Very Good',
  [ListingCondition.Good]: 'Used - Good',
  [ListingCondition.Acceptable]: 'Used - Acceptable',
};

function ConditionOptions() {
  const options = useMemo(
    () => [
      ListingCondition.New,
      ListingCondition.LikeNew,
      ListingCondition.VeryGood,
      ListingCondition.Good,
      ListingCondition.Acceptable,
    ],
    [],
  );
  return (
    <>
      {options.map(cond => (
        <option key={cond} value={cond}>
          {conditionNames[cond]}
        </option>
      ))}
    </>
  );
}

function ListingPreview({
  book,
  thumbnail,
  price,
  description,
  condition,
}: {
  book: IGoogleBookFragment;
  thumbnail: string;
  price: number;
  description: string;
  condition: ListingCondition;
}) {
  const listing = useMemo(() => {
    const createdAt = new Date().toISOString();
    return {
      __typename: 'Listing',
      book: { ...book, __typename: 'Book', thumbnail, id: createdAt },
      price,
      createdAt,
      description,
      condition,
      id: createdAt,
    } as IBasicListingFragment;
  }, [book, condition, description, price, thumbnail]);
  return <Book isPreview listing={listing} book={listing.book} />;
}

function GoogleBookPreview({
  book,
  onClick,
}: {
  book: ISearchGoogleBookFragment;
  onClick;
}) {
  return (
    <button className="md:p-3" type="button" onClick={onClick}>
      <div className="overflow-hidden rounded-lg md:w-56 bg-white shadow-lg hover:scale-105 transition duration-200 ease-in-out">
        <div className="relative bg-light">
          <img
            className="w-full md:w-56"
            alt={`${book.title} book cover`}
            src={book.thumbnail || ''}
            id={book.googleId}
          />
        </div>

        <div className="p-3 mt-3 space-y-1 md:w-56">
          <p className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
            {book.title}
          </p>
          {book.subTitle ? (
            <p className="text-sm leading-tight">{book.subTitle}</p>
          ) : null}
          <p className="leading-tight">{book.authors.join(', ')}</p>
          <p className="opacity-75  text-sm">
            Published on <RelativeDate date={book.publishedAt} />
          </p>
          {book.isbn.length ? (
            <p className="opacity-75 text-sm leading-tight">
              ISBN: {book.isbn.join(', ')}
            </p>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function Post() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [search, searchRes] = useLazyQuery(SEARCH_GOOGLE, {
    fetchPolicy: 'no-cache',
  });
  const [isSearchFocused, setSearchFocused] = useState(false);
  const focusSearch = useCallback(() => setSearchFocused(true), []);
  const onChange = useMemo(() => {
    const callSearch = debounce(
      (searchValue: string) => search({ variables: { query: searchValue } }),
      300,
    );
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
      callSearch(e.target.value);
    };
  }, [search]);

  const [selectedGoogleBookId, setSelectedGoogleBookId] = useState('');

  const googleBookRes = useQuery(GOOGLE_BOOK, {
    variables: { id: selectedGoogleBookId },
    skip: !selectedGoogleBookId,
  });
  const googleBook = googleBookRes.data?.googleBook;

  const [selectedImage, setSelectedImage] = useState('');

  const setGBId = useCallback((id: string) => {
    setSelectedGoogleBookId(id);
    setSearchFocused(false);
    setSelectedImage('');
  }, []);

  const [post, postRes] = useMutation(CREATE_LISTING);
  const cache = postRes.client.cache;
  const onSubmit = useCallback(
    async (v: {
      condition: ListingCondition;
      price: number;
      description: string;
    }) => {
      if (!googleBook || !selectedImage) {
        return;
      }
      const res = await post({
        variables: {
          listing: {
            description: v.description,
            googleId: googleBook.googleId,
            price: v.price,
            condition: v.condition,
            coverIndex: googleBook.possibleCovers.indexOf(selectedImage),
          },
        },
      });
      const newListing = res.data?.createListing;
      if (!newListing) {
        return;
      }
      cache.updateQuery({ query: MY_LISTINGS }, data => {
        if (!data?.me || data.me.__typename === 'Admin' || !newListing) {
          return;
        }
        return {
          ...data,
          me: { ...data.me, listings: [newListing, ...data.me.listings] },
        };
      });
      router.push(`/b/${newListing.book.id}`);
    },
    [googleBook, selectedImage, post, cache, router],
  );

  if (searchRes.error || googleBookRes.error) {
    return null;
  }

  return (
    <Layout title="Post a book">
      <div className="md:max-w-7xl md:mx-auto space-y-6 my-8">
        <div className="w-full">
          <div className="relative text-lg text-dark">
            <Icon className="absolute top-3 left-3" icon={searchOutline} />
            <input
              className="w-full rounded p-2 pl-11 outline-none ring-dark focus:ring-2 active:ring-2"
              type="text"
              onChange={onChange}
              value={searchValue}
              placeholder="Find a book..."
              onFocus={focusSearch}
            />
          </div>

          <div
            className="overflow-hidden transition-all"
            style={{
              height: !selectedGoogleBookId || isSearchFocused ? 'auto' : 0,
            }}
          >
            <BookPreviews>
              {searchRes.data?.searchGoogle?.map(gb => (
                <GoogleBookPreview
                  key={gb.googleId}
                  book={gb}
                  onClick={() => setGBId(gb.googleId)}
                />
              ))}
            </BookPreviews>
          </div>
        </div>

        <div
          className="w-full flex items-center flex-wrap justify-center"
          onClick={e => {
            if (
              !(e.target instanceof HTMLButtonElement) &&
              !(e.target instanceof HTMLImageElement)
            ) {
              return;
            }
            setSelectedImage(e.target.id);
          }}
        >
          {googleBookRes.data?.googleBook.possibleCovers.map(src => (
            <button
              key={src}
              type="button"
              id={src}
              className="m-4 p-2 rounded-lg shadow-lg hover:scale-105 transition duration-200 ease-in-out overflow-hidden bg-white w-5/12 md:w-56"
            >
              <img
                className="w-full rounded-lg"
                src={src}
                alt={googleBookRes.data.googleBook.title}
                id={src}
              />
            </button>
          ))}
        </div>

        {selectedImage && googleBookRes.data?.googleBook ? (
          <Formik
            initialValues={{
              condition: '' as ListingCondition,
              price: 0,
              description: '',
            }}
            onSubmit={onSubmit}
          >
            {({ values, setFieldValue, handleBlur }) => (
              <>
                <hr />
                <div className="space-y-8 max-w-sm mx-auto">
                  <div className="w-full">
                    <ListingPreview
                      book={googleBookRes.data?.googleBook}
                      thumbnail={selectedImage}
                      condition={values.condition as ListingCondition}
                      description={values.description}
                      price={values.price}
                    />
                  </div>

                  <Form className="w-full space-y-4 overflow-hidden rounded-lg bg-white shadow-lg p-4">
                    <label className="w-full flex">
                      <div className="w-1/2 text-right p-2">Book Condition</div>
                      <Field
                        component="select"
                        name="condition"
                        className="w-1/2 p-2 border border-dark rounded bg-white disabled:bg-light disabled:pointer-events-none"
                        disabled={postRes.loading}
                      >
                        <option value="" />
                        <ConditionOptions />
                      </Field>
                    </label>
                    <label className="w-full flex">
                      <div className="w-1/2 text-right p-2">Price</div>
                      <NumberFormat
                        className="w-1/2 p-2 border border-dark rounded disabled:bg-light disabled:pointer-events-none"
                        name="price"
                        value={values.price / 100}
                        onValueChange={({ floatValue }) => {
                          if (floatValue) {
                            setFieldValue('price', floatValue * 100);
                          }
                        }}
                        onBlur={handleBlur}
                        prefix="$"
                        thousandSeparator
                        disabled={postRes.loading}
                      />
                    </label>
                    <label className="w-full flex">
                      <div className="w-1/2 text-right p-2">Description</div>
                      <Field
                        component="textarea"
                        name="description"
                        className="w-1/2 p-2 border border-dark rounded disabled:bg-light disabled:pointer-events-none"
                        disabled={postRes.loading}
                      />
                    </label>

                    <button
                      disabled={postRes.loading}
                      type="submit"
                      className="w-1/2 ml-auto flex items-center justify-center text-xl font-semibold py-2 px-4 rounded border bg-primary text-white disabled:opacity-75 disabled:pointer-events-none"
                    >
                      <Icon
                        className={postRes.loading ? 'animate-spin' : ''}
                        icon={postRes.loading ? reloadOutline : addOutline}
                      />
                      Post
                    </button>
                  </Form>
                </div>
              </>
            )}
          </Formik>
        ) : null}
      </div>
    </Layout>
  );
}

export default withApollo(Post);
export const getServerSideProps = makeApolloSSR(Post);
