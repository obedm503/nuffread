import { join } from 'path';
import { useCallback } from 'react';
import { useRouter } from './router';

export const useSearch = () => {
  const { location, history } = useRouter();

  const currentSearch = history.location.search;
  const searchValue = new URLSearchParams(currentSearch).get('q') || undefined;

  const { replace, push } = history;
  const onSearch = useCallback(
    (value: string | undefined) => {
      let search: string | undefined;
      if (value) {
        const query = new URLSearchParams(location.search);
        query.set('q', value);
        search = query.toString();
      }
      replace({
        pathname: '/search',
        search,
      });
    },
    [location.search, replace],
  );

  const onClick = useCallback(
    (id: string) => {
      push({
        pathname: join('/p', id),
        search: currentSearch,
      });
    },
    [push, currentSearch],
  );

  return {
    searchValue,
    onSearch,
    onClick,
  };
};
