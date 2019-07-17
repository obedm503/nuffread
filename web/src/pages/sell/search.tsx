import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { SearchPage } from '../buy';

export const Search: React.FunctionComponent<RouteComponentProps> = props => {
  return <SearchPage {...props} base="/search" />;
};
