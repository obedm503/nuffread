import * as React from 'react';
import { Redirect, RouteProps } from 'react-router';
import { Routes } from '../components';
import { Details } from './details';
import { Home } from './home';

const routes: RouteProps[] = [
  {
    path: '/listings/:listingId/details',
    exact: true,
    component: Details,
  },
  { path: '/listings/:listingId?', exact: true, component: Home },
  { component: () => <Redirect to="/listings" /> },
];

export const Buy: React.SFC = () => {
  return <Routes routes={routes} />;
};
