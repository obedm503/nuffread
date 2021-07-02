import { GetServerSideProps } from 'next';

export default function Index() {
  return null;
}
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/explore',
    permanent: false,
  },
});
