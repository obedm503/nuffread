import { Form, Formik } from 'formik';
import { key } from 'ionicons/icons';
import Head from 'next/head';
import { useCallback } from 'react';
import { object } from 'yup';
import { useMutation } from '../../apollo/client';
import { makeApolloSSR } from '../../apollo/ssr';
import { withApollo } from '../../apollo/with-apollo';
import { Email } from '../../components/controls';
import { Icon } from '../../components/icon';
import { LoginLayout } from '../../components/login-wrapper';
import { SubmitButton } from '../../components/submit-button';
import { Request_Reset_PasswordDocument as REQUEST_RESET_PASSWORD } from '../../queries';
import { emailSchema } from '../../util';
import { withToHome } from '../../util/auth';

const schema = object().shape({ email: emailSchema });
function RequestToken() {
  const [reset, res] = useMutation(REQUEST_RESET_PASSWORD);

  const onSubmit = useCallback(
    async ({ email }) => {
      try {
        const res = await reset({
          variables: { email },
        });
        if (res.data?.requestResetPassword) {
          // tracker.event('REQUEST_RESET_PASSWORD', { email });
        }
      } catch {}
    },
    [reset],
  );

  if (res.error) {
    return <div className="w-full">Something went wrong</div>;
  }

  if (res.data?.requestResetPassword) {
    return (
      <div className="w-full">
        Click the link in your email to reset your passphrase.
      </div>
    );
  }

  return (
    <div className="w-full">
      <Formik<{ email: string }>
        onSubmit={onSubmit}
        validationSchema={schema}
        initialValues={{ email: '' }}
      >
        <Form>
          <Email label="Email" name="email" disabled={res.loading} />

          <div className="text-center mt-6">
            <SubmitButton disabled={res.loading}>
              <Icon icon={key} className="mr-2" />
              Change Passphrase
            </SubmitButton>
          </div>
        </Form>
      </Formik>
    </div>
  );
}

const Reset = withToHome(function Reset(props) {
  return (
    <LoginLayout>
      <Head>
        <title>Reset Passphrase - nuffread</title>
      </Head>

      <RequestToken />
    </LoginLayout>
  );
});

export default withApollo(Reset);
export const getServerSideProps = makeApolloSSR(Reset);
