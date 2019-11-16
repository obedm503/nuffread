import { join } from 'path';
import { useCallback } from 'react';
import { useRouter } from './router';

export const useSearch = () => {
  const { location, history, match } = useRouter();

  const currentSearch = history.location.search;
  const searchValue = new URLSearchParams(currentSearch).get('q') || undefined;

  const push = history.push;
  const onSearch = useCallback(
    (value: string | undefined) => {
      let search: string | undefined;
      if (value) {
        const query = new URLSearchParams(location.search);
        query.set('q', value);
        search = query.toString();
      }
      push({
        pathname: location.pathname,
        search,
      });
    },
    [location.search, location.pathname, push],
  );

  const onClick = useCallback(
    (id: string) => {
      push({
        pathname: join(match.url, id),
        search: currentSearch,
      });
    },
    [push, match.url, currentSearch],
  );

  return {
    searchValue,
    onSearch,
    onClick,
  };
};
