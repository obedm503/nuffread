import { join } from 'path';
import { useCallback, useState } from 'react';
import { useRouter } from './router';

export const useSearch = () => {
  const { location, history, match } = useRouter();

  const searchParams = new URLSearchParams(history.location.search);

  // const onSearch = useCallback(
  //   (searchValue: string | undefined) => {
  //     let search: string | undefined;
  //     if (searchValue) {
  //       const query = new URLSearchParams(location.search);
  //       query.set('q', searchValue);
  //       search = query.toString();
  //     }
  //     try {
  //       history.push({
  //         pathname: location.pathname,
  //         search,
  //       });
  //     } catch (e) {
  //       console.warn('history error', e);
  //     }
  //   },
  //   [location, history],
  // );
  const [searchValue, setSearch] = useState('');
  const onSearch = useCallback(
    (value: string | undefined) => {
      setSearch(value || '');
    },
    [setSearch],
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
    // searchValue: searchParams.get('q') || undefined,
    searchValue,
    onSearch,
    onClick,
  };
};
