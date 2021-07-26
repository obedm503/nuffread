import Head from 'next/head';
import { Navbar } from './navbar';

export function Layout({ children, title }: { children; title?: string }) {
  return (
    <>
      {title ? (
        <Head>
          <title>{title} - nuffread</title>
        </Head>
      ) : null}

      <Navbar />

      <main className="max-w-6xl mx-auto">{children}</main>
    </>
  );
}
