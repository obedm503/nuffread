import { GetServerSideProps } from 'next';
import { initializeApolloClient } from '../../apollo/with-apollo';
import { Confirm_EmailDocument as CONFIRM_EMAIL } from '../../queries';

export default function ConfirmCode() {
  return null;
}
export const getServerSideProps: GetServerSideProps = async ctx => {
  const client = initializeApolloClient(ctx);
  const code = ctx.query.confirmationCode as string;

  try {
    const res = await client.mutate({
      mutation: CONFIRM_EMAIL,
      variables: { code },
    });
    if (res.data?.confirm) {
      // tracker.event('CONFIRM_EMAIL', {});
    }
  } catch (e) {}

  return { redirect: { destination: '/', permanent: false } };
};
