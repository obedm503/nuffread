import * as React from 'react';
import { Redirect, RouteProps } from 'react-router';
import { Routes } from '../components';
import { Details } from './details';
import { Home } from './home';

const routes: RouteProps[] = [
  { path: '/', exact: true, component: () => <Redirect to="/listings" /> },
  {
    path: '/listings/:listingId/details',
    component: Details,
    exact: true,
  },
  { path: '/listings/:listingId?', component: Home },
];

export const Buy: React.SFC = () => {
  return <Routes routes={routes} />;
};
