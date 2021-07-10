import { gql } from '@apollo/client';
import { GetServerSideProps } from 'next';
import { initializeApolloClient } from '../../apollo/with-apollo';
import { IMutation, IMutationConfirmArgs } from '../../schema.gql';

const CONFIRM_EMAIL = gql`
  mutation ConfirmEmail($code: String!) {
    confirm(code: $code)
  }
`;

export default function ConfirmCode() {
  return null;
}
export const getServerSideProps: GetServerSideProps = async ctx => {
  const client = initializeApolloClient(ctx);
  const code = ctx.query.confirmationCode as string;

  try {
    const res = await client.mutate<IMutation, IMutationConfirmArgs>({
      mutation: CONFIRM_EMAIL,
      variables: { code },
    });
    if (res.data?.confirm) {
      // tracker.event('CONFIRM_EMAIL', {});
    }
  } catch (e) {}

  return { redirect: { destination: '/', permanent: false } };
};
