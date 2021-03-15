import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Admin | Nuffread</title>
        <link rel="icon" href="https://www.nuffread.com/favicon.ico" />
      </Head>

      <div className="absolute min-h-full w-full min-w-full bg-tertiary">
        <Component {...pageProps} />
      </div>
    </>
  );
}
