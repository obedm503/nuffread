import { Navbar } from './navbar';

export function Layout({ children }) {
  return (
    <>
      <Navbar />

      <main className="max-w-6xl mx-auto">{children}</main>
    </>
  );
}
