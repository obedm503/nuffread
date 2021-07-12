import { Form, Formik } from 'formik';
import { key } from 'ionicons/icons';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { object } from 'yup';
import { useMutation } from '../../apollo/client';
import { makeApolloSSR } from '../../apollo/ssr';
import { withApollo } from '../../apollo/with-apollo';
import { apolloFormErrors, Passphase } from '../../components/controls';
import { Icon } from '../../components/icon';
import { LoginLayout } from '../../components/login-wrapper';
import { SubmitButton } from '../../components/submit-button';
import { Reset_PasswordDocument as RESET_PASSWORD } from '../../queries';
import { strongPasswordSchema } from '../../util';
import { withToHome } from '../../util/auth';

const Errors = apolloFormErrors({
  WRONG_CREDENTIALS:
    'An error occurred while trying to reset the passphrase. Make sure you clicked the correct link.',
});

const schema = object().shape({ password: strongPasswordSchema });
const ResetForm: React.FC<{ token: string }> = ({ token }) => {
  const [reset, res] = useMutation(RESET_PASSWORD);
  const { push } = useRouter();

  const onSubmit = useCallback(
    async ({ password }) => {
      try {
        const res = await reset({ variables: { password, token } });
        if (res.data?.resetPassword) {
          // tracker.event('RESET_PASSWORD', {});
          push('/login');
        }
      } catch {}
    },
    [push, reset, token],
  );

  return (
    <Formik<{ password: string }>
      onSubmit={onSubmit}
      validationSchema={schema}
      initialValues={{ password: '' }}
    >
      <Form>
        <Passphase
          label="New Passphrase"
          name="password"
          disabled={res.loading}
        />

        <Errors error={res.error} />

        <div className="text-center mt-6">
          <SubmitButton disabled={res.loading}>
            <Icon icon={key} className="mr-2" />
            Change Passphrase
          </SubmitButton>
        </div>
      </Form>
    </Formik>
  );
};

const Reset = withToHome(function Reset() {
  const router = useRouter();
  return (
    <LoginLayout>
      <Head>
        <title>Reset Passphase - nuffread</title>
      </Head>

      <div className="w-full">
        <ResetForm token={router.query.token as string} />
      </div>
    </LoginLayout>
  );
});

export default withApollo(Reset);
export const getServerSideProps = makeApolloSSR(Reset);
