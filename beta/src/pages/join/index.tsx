import { gql } from '@apollo/client';
import { Form, Formik } from 'formik';
import { addOutline } from 'ionicons/icons';
import Head from 'next/head';
import { useCallback } from 'react';
import { object } from 'yup';
import { useMutation } from '../../apollo/client';
import { makeApolloSSR } from '../../apollo/ssr';
import { withApollo } from '../../apollo/with-apollo';
import { apolloFormErrors, Email, Passphase } from '../../components/controls';
import { Icon } from '../../components/icon';
import { Link } from '../../components/link';
import { LoginLayout } from '../../components/login-wrapper';
import { SubmitButton } from '../../components/submit-button';
import { IMutation, IMutationRegisterArgs } from '../../schema.gql';
import { strongPasswordSchema, studentEmailSchema } from '../../util';
import { withToHome } from '../../util/auth';

const REGISTER = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      id
      email
    }
  }
`;
const Errors = apolloFormErrors({
  DUPLICATE_USER: (
    <>
      This email is already registered.{' '}
      <Link href="/login" block={false}>
        Login?
      </Link>
    </>
  ),
});

type FormSchema = { email: string; password: string };
const schema = object().shape({
  email: studentEmailSchema,
  password: strongPasswordSchema,
});

const onCompleted = (data: IMutation) => {
  if (!data.register) {
    return;
  }
  console.log('track register', { email: data.register.email });
  // tracker.register({ email: data.register.email });
};

function Register() {
  const [join, res] = useMutation<IMutationRegisterArgs>(REGISTER, {
    onCompleted,
  });
  const onSubmit = useCallback(
    async ({ email, password }) => {
      try {
        await join({ variables: { email, password } });
      } catch {}
    },
    [join],
  );

  if (res.data?.register) {
    return (
      <div className="mx-auto">Click the confirmation link in your email.</div>
    );
  }

  return (
    <div className="w-full">
      <Formik<FormSchema>
        onSubmit={onSubmit}
        validationSchema={schema}
        initialValues={{ email: '', password: '' }}
      >
        <Form>
          <Email label="Email" name="email" disabled={res.loading} />
          <Passphase label="Passphase" name="password" disabled={res.loading} />

          <Errors error={res.error} />

          <div className="text-center mt-6">
            <SubmitButton disabled={res.loading}>
              <Icon icon={addOutline} className="mr-2" />
              Join
            </SubmitButton>
          </div>
        </Form>
      </Formik>
    </div>
  );
}

const Join = withToHome(function Join(props) {
  return (
    <LoginLayout>
      <Head>
        <title>Join - nuffread</title>
      </Head>

      <Register />
    </LoginLayout>
  );
});

export default withApollo(Join);
export const getServerSideProps = makeApolloSSR(Join);
