import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles.css';
import { ApolloProvider } from '@apollo/react-hooks';
import { useApollo } from '../apollo';

export default function App({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps.initialApolloState);

  return (
    <ApolloProvider client={apolloClient}>
      <>
        <Head>
          <title>Admin | Nuffread</title>
          <link rel="icon" href="https://www.nuffread.com/favicon.ico" />
        </Head>

        <div className="absolute min-h-full w-full min-w-full bg-tertiary">
          <Component {...pageProps} />
        </div>
      </>
    </ApolloProvider>
  );
}
