import * as React from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { Routes } from '../../components';
import { Home } from './home';
import { New } from './new';

const routes: RouteProps[] = [
  { path: '/new', exact: true, component: New },
  { component: Home },
];

export default class Private extends React.Component<RouteComponentProps> {
  render() {
    return <Routes routes={routes} />;
  }
}
