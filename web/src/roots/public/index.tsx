import memoizeOne from 'memoize-one';
import React from 'react';
import { Redirect, RouteProps } from 'react-router';
import { IonRoutes } from '../../components';
import { Book } from '../../pages/book';
import { Explore } from '../../pages/explore';
import { Listing } from '../../pages/listing';
import { Search } from '../../pages/search';
import { useRootValidator } from '../../state';
import { RootPageProps } from '../../util.types';

const getRoutes = memoizeOne(globalRoutes => {
  const routes: RouteProps[] = [
    { path: '/explore', exact: true, render: () => <Explore /> },
    { path: '/search', exact: true, render: () => <Search /> },
    // keep /invite just incase a link exists in wild
    { path: '/invite', exact: true, render: () => <Redirect to="join" /> },
    {
      path: '/p/:listingId',
      component: ({ match }) => (
        <Listing id={match.params.listingId} defaultHref="/explore" />
      ),
    },
    {
      path: '/b/:bookId',
      component: ({ match }) => (
        <Book bookId={match.params.bookId} defaultHref="/explore" />
      ),
    },
    { path: '/', exact: true, render: () => <Redirect to="/explore" /> },
  ];
  return globalRoutes.concat(routes);
});

const validRoots = [
  'explore',
  'search',
  'p',
  'b',
  'invite',
  'login',
  'join',
  'reset',
];

export default React.memo<RootPageProps>(function ({ globalRoutes }) {
  if (!useRootValidator({ validRoots })) {
    return <Redirect to="/explore" />;
  }

  return <IonRoutes routes={getRoutes(globalRoutes)} />;
});
