import { Navbar } from './navbar';

export function LoginLayout({ children }) {
  return (
    <div className="h-screen bg-primary">
      <Navbar />

      <main className="max-w-6xl mx-auto">
        <div className="flex" style={{ marginTop: '15vh' }}>
          <div className="w-2/3 m-6">
            <div className="bg-medium" style={{ height: '50vh' }}></div>
          </div>
          <div className="w-1/3 m-6">
            <div
              className="bg-white rounded-lg shadow-lg p-4 flex"
              style={{ height: '50vh' }}
            >
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
