export function Footer() {
  return (
    <footer className="block mx-24 px-2 py-4">
      <div className="container">
        <hr className="mb-4 border-b-1 border-gray-300" />

        <div className="px-4 text-center text-sm text-gray-600 font-semibold py-1">
          Copyright © {new Date().getFullYear()}{' '}
          <a
            href="https://www.nuffread.com"
            className="text-gray-600 hover:text-gray-800 text-sm font-semibold py-1"
          >
            nuffread
          </a>
        </div>
      </div>
    </footer>
  );
}
