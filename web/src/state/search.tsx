import { join } from 'path';
import { useCallback } from 'react';
import { useRouter } from './router';

export const useSearch = () => {
  const { location, history, match } = useRouter();

  const searchParams = new URLSearchParams(history.location.search);

  const searchValue = searchParams.get('q') || undefined;
  const onSearch = useCallback(
    (value: string | undefined) => {
      let search: string | undefined;
      if (value) {
        const query = new URLSearchParams(location.search);
        query.set('q', value);
        search = query.toString();
      }
      history.push({
        pathname: location.pathname,
        search,
      });
    },
    [location, history],
  );

  const onClick = useCallback(
    (id: string) => {
      history.push({
        pathname: join(match.url, id),
        search: searchParams.toString(),
      });
    },
    [history, match, searchParams],
  );

  return {
    searchValue,
    onSearch,
    onClick,
  };
};
