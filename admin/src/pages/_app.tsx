import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Admin | Nuffread</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
