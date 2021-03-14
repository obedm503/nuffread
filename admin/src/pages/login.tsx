import { useApolloClient } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Router from 'next/router';
import { useCallback, useEffect } from 'react';
import { IMutationLoginArgs, SystemUserType } from '../schema.gql';
import { useMutation } from '../util/apollo';
import { useMe } from '../util/auth';

const Control = (
  props: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
) => (
  <div className="relative w-full mb-3">
    <label className="block uppercase text-light-700 text-xs font-bold">
      {props.placeholder}

      <input
        className="mt-2 px-3 py-3 placeholder-light-400 text-light-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full"
        style={{ transition: 'all .15s ease' }}
        required
        {...props}
      />
    </label>
  </div>
);

const LOGIN = gql`
  mutation Login($email: String!, $password: String!, $type: SystemUserType!) {
    login(email: $email, password: $password, type: $type) {
      ... on Admin {
        id
        email
      }
    }
  }
`;

function withToHome(Children) {
  return () => {
    const { me, loading } = useMe();
    const hasUser = !!me;

    useEffect(() => {
      if (loading) return;
      if (hasUser) {
        Router.push('/');
      }
    }, [loading, hasUser]);

    if (loading || hasUser) {
      return null;
    }

    return <Children />;
  };
}

export default withToHome(function Login() {
  const [login] = useMutation<IMutationLoginArgs>(LOGIN);
  const client = useApolloClient();
  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!(e.target instanceof HTMLFormElement)) {
        return;
      }
      const values = new FormData(e.target);
      const res = await login({
        variables: {
          email: values.get('email').toString(),
          password: values.get('password').toString(),
          type: SystemUserType.Admin,
        },
      });

      if (res?.data?.login) {
        await client.resetStore();
        await Router.push('/');
      }
    },
    [client, login],
  );

  return (
    <main className="absolute w-full h-full">
      <div className="container mx-auto px-4 h-full">
        <div className="flex content-center items-center justify-center h-full">
          <div className="w-full lg:w-4/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-light border-0">
              <div className="flex-auto px-4 lg:px-10 pb-10 pt-6">
                <h2 className="text-center text-3xl text-primary font-bold mb-5">
                  nuffread
                </h2>

                <form onSubmit={onSubmit}>
                  <Control
                    placeholder="Email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    maxLength={255}
                  />
                  <Control
                    placeholder="Password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    maxLength={32}
                  />

                  <div className="text-center mt-6">
                    <button
                      className="bg-primary hover:bg-secondary text-white text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full"
                      type="submit"
                      style={{ transition: 'all .15s ease' }}
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
});
