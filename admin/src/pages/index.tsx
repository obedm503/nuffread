import Router from 'next/router';
import { useEffect } from 'react';
import { withApollo } from '../apollo';
import { withToLogin } from '../util/auth';

export default withApollo()(
  withToLogin(function Index() {
    useEffect(() => {
      Router.push('/users');
    });

    return null;
  }),
);
