import Router from 'next/router';
import { useEffect } from 'react';
import { withToLogin } from '../util/auth';

export default withToLogin(function Index() {
  useEffect(() => {
    Router.push('/users');
  });

  return null;
});
