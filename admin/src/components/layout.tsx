import { Navbar } from './navbar';

export function Layout({ children }) {
  return (
    <>
      <Navbar />

      <main className="mx-24">{children}</main>
    </>
  );
}
