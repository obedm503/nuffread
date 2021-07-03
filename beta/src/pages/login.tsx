import { gql, useApolloClient } from '@apollo/client';
import { Field, Form, Formik } from 'formik';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { useMutation } from '../apollo/client';
import { makeApolloSSR } from '../apollo/ssr';
import { withApollo } from '../apollo/with-apollo';
import { Navbar } from '../components/navbar';
import { IMutationLoginArgs, SystemUserType } from '../schema.gql';
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

      <Field
        className="mt-2 px-3 py-3 placeholder-light-400 text-light-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full border border-light"
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
      ... on User {
        id
        email
      }
    }
  }
`;

function withToHome(Children) {
  return () => {
    const router = useRouter();
    const { me, loading } = useMe();
    const hasUser = !!me;

    useEffect(() => {
      if (loading) return;
      if (hasUser) {
        router.push('/');
      }
    }, [loading, hasUser, router]);

    if (loading || hasUser) {
      return null;
    }

    return <Children />;
  };
}

const Login = withToHome(function Login() {
  const router = useRouter();
  const [login] = useMutation<IMutationLoginArgs>(LOGIN);
  const client = useApolloClient();
  const onSubmit = useCallback(
    async ({ email, password }) => {
      const res = await login({
        variables: {
          email,
          password,
          type: SystemUserType.User,
        },
      });

      if (res?.data?.login) {
        await client.resetStore();
        await router.push('/');
      }
    },
    [client, login, router],
  );

  return (
    <div className="h-screen bg-primary">
      <Navbar />

      <main className="max-w-6xl mx-auto">
        <Head>
          <title>Login | Nuffread</title>
        </Head>

        <div className="container">
          <div className="flex" style={{ marginTop: '15vh' }}>
            <div className="w-2/3 m-6">
              <div className="bg-medium" style={{ height: '50vh' }}></div>
            </div>
            <div className="w-1/3 m-6">
              <div
                className="bg-white rounded-lg shadow-lg p-4"
                style={{ height: '50vh' }}
              >
                <Formik
                  onSubmit={onSubmit}
                  initialValues={{ email: '', password: '' }}
                >
                  <Form>
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
                  </Form>
                </Formik>

                <Link href="/reset">
                  <a className="block text-center hover:underline hover:text-secondary m-2">
                    Forgot password?
                  </a>
                </Link>
                <Link href="/join">
                  <a className="block text-center hover:underline hover:text-secondary">
                    Or Join
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
});

export default withApollo(Login);
export const getServerSideProps = makeApolloSSR(Login);
