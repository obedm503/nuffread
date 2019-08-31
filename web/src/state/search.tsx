import { join } from 'path';
import { useRouter } from './router';

export const useSearch = () => {
  const { location, history, match } = useRouter();

  const searchParams = new URLSearchParams(history.location.search);

  const onSearch = (searchValue: string | undefined) => {
    let search: string | undefined;
    if (searchValue) {
      const query = new URLSearchParams(location.search);
      query.set('q', searchValue);
      search = query.toString();
    }
    history.push({
      pathname: location.pathname,
      search,
    });
  };

  const onClick = (id: string) => {
    history.push({
      pathname: join(match.url, id),
      search: searchParams.toString(),
    });
  };

  return {
    searchValue: searchParams.get('q') || undefined,
    onSearch,
    onClick,
  };
};
