import * as React from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { Routes } from '../components';
import { Details } from './details';
import { Home } from './home';

const routes: RouteProps[] = [
  {
    path: '/:listingId/details',
    component: Details,
    exact: true,
  },
  { path: '/:listingId?', component: Home },
];

export const Buy: React.SFC<RouteComponentProps<{}>> = ({ match }) => {
  return <Routes base={match.url} routes={routes} />;
};
