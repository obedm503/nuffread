import { join } from 'path';
import { useCallback } from 'react';
import { useRouter } from './router';

export const useSearch = (base: string) => {
  const { location, history } = useRouter();

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
        pathname: base,
        search,
      });
    },
    [location.search, base, push],
  );

  const onClick = useCallback(
    (id: string) => {
      push({
        pathname: join(base, id),
        search: currentSearch,
      });
    },
    [push, base, currentSearch],
  );

  return {
    searchValue,
    onSearch,
    onClick,
  };
};
