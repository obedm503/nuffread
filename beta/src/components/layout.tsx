import Head from 'next/head';
import { classes } from '../util';
import { Navbar } from './navbar';

export function Layout({
  children,
  title,
  className,
}: {
  children?;
  title?: string;
  className?: string;
}) {
  return (
    <div className={classes('min-h-screen', className)}>
      {title ? (
        <Head>
          <title>{title} - nuffread</title>
        </Head>
      ) : null}

      <Navbar />

      <main className="md:max-w-7xl md:mx-auto py-4">{children}</main>
    </div>
  );
}
