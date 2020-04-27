import { withApollo } from '../apollo';
import { Layout } from '../components';
import { useToLogin } from '../util/auth';

export default withApollo()(function Sessions() {
  useToLogin();

  return (
    <Layout>
      <div className="px-4 md:px-10 mx-auto w-full">
        <div className="flex flex-wrap mt-4">
          <div className="w-full px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
              <div className="rounded-t mb-0 px-4 py-3 border-0">
                <div className="flex flex-wrap items-center">
                  <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                    <h3 className="font-semibold text-base text-dark">
                      Sessions
                    </h3>
                  </div>
                </div>
              </div>
              <div className="block w-full overflow-x-auto">
                {/* Projects table */}
                <table className="items-center w-full bg-transparent border-collapse">
                  <thead className="thead-light">
                    <tr>
                      <th className="px-6 bg-light text-dark align-middle border border-solid border-light py-3 text-xs uppercase border-l-0 border-r-0 whitespace-no-wrap font-semibold text-left">
                        Referral
                      </th>
                      <th className="px-6 bg-light text-dark align-middle border border-solid border-light py-3 text-xs uppercase border-l-0 border-r-0 whitespace-no-wrap font-semibold text-left">
                        Visitors
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-no-wrap p-4 text-left">
                        Facebook
                      </th>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-no-wrap p-4">
                        1,480
                      </td>
                    </tr>
                    <tr>
                      <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-no-wrap p-4 text-left">
                        Facebook
                      </th>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-no-wrap p-4">
                        5,480
                      </td>
                    </tr>
                    <tr>
                      <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-no-wrap p-4 text-left">
                        Google
                      </th>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-no-wrap p-4">
                        4,807
                      </td>
                    </tr>
                    <tr>
                      <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-no-wrap p-4 text-left">
                        Instagram
                      </th>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-no-wrap p-4">
                        3,678
                      </td>
                    </tr>
                    <tr>
                      <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-no-wrap p-4 text-left">
                        twitter
                      </th>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-no-wrap p-4">
                        2,645
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
});
