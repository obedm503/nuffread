import React, { memo } from 'react';
import { RouteComponentProps } from 'react-router';
import { SearchPage } from '../../components/search';

export const Search = memo<RouteComponentProps>(props => {
  return <SearchPage {...props} />;
});
