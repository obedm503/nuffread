import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="https://www.nuffread.com/favicon.ico" />
      </Head>

      <Component {...pageProps} />
    </>
  );
}
