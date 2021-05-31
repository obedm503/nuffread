import Head from 'next/head';
import { makeGetSSP, withGraphQL } from '../apollo-client';
import { Layout } from '../components/layout';

const Explore = function Explore() {
  return (
    <>
      <Head>
        <title>Explore | Nuffread</title>
      </Head>

      <div>explore</div>
    </>
  );
};

export default withGraphQL(Explore);
export const getServerSideProps = makeGetSSP(Explore);
