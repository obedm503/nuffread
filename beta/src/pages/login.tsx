import { Form, Formik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { object } from 'yup';
import { useMutation } from '../apollo/client';
import { makeApolloSSR } from '../apollo/ssr';
import { withApollo } from '../apollo/with-apollo';
import { apolloFormErrors, Email, Passphase } from '../components/controls';
import { TextLink } from '../components/link';
import { LoginLayout } from '../components/login-wrapper';
import { SubmitButton } from '../components/submit-button';
import { LoginDocument as LOGIN, SystemUserType } from '../queries';
import { emailSchema, passwordSchema } from '../util';
import { withToHome } from '../util/auth';

const Errors = apolloFormErrors({
  NOT_CONFIRMED:
    'Email is not yet confirmed. Click the link on the email we sent you to confirm it.',
  WRONG_CREDENTIALS: 'Wrong email or passphrase.',
});

type FormSchema = { email: string; password: string };
const schema = object().shape({
  email: emailSchema,
  password: passwordSchema,
});

const Login = withToHome(function Login(props) {
  const router = useRouter();
  const [login, res] = useMutation(LOGIN);
  const client = res.client;
  const onSubmit = useCallback(
    async ({ email, password }) => {
      try {
        const res = await login({
          variables: {
            email,
            password,
            type: SystemUserType.User,
          },
        });

        if (res.data?.login) {
          await client.resetStore();
          await router.push('/');
        }
      } catch (e) {}
    },
    [client, login, router],
  );

  return (
    <LoginLayout>
      <Head>
        <title>Login - nuffread</title>
      </Head>

      <div className="w-full">
        <Formik<FormSchema>
          onSubmit={onSubmit}
          validationSchema={schema}
          initialValues={{ email: '', password: '' }}
        >
          <Form>
            <Email label="Email" name="email" disabled={res.loading} />
            <Passphase
              label="Passphase"
              name="password"
              disabled={res.loading}
            />

            <Errors error={res.error} />

            <div className="text-center mt-6">
              <SubmitButton disabled={res.loading}>Sign In</SubmitButton>
            </div>
          </Form>
        </Formik>

        <div className="m-2">
          <TextLink href="/reset">Forgot password?</TextLink>
          <TextLink href="/join">Or Join</TextLink>
        </div>
      </div>
    </LoginLayout>
  );
});

export default withApollo(Login);
export const getServerSideProps = makeApolloSSR(Login);
