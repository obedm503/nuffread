import Router from 'next/router';
import { useEffect } from 'react';
import { withApollo } from '../apollo';
import { useToLogin } from '../util/auth';

export default withApollo()(function Index() {
  useToLogin();

  useEffect(() => {
    Router.push('/users');
  });

  return null;
});
