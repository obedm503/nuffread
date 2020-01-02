import { useContext } from 'react';
import { __RouterContext } from 'react-router';

export function useRouter() {
  return useContext(__RouterContext);
}

export function useRootValidator({ validRoots }: { validRoots: string[] }) {
  const { location } = useRouter();
  const root = location.pathname.split('/').filter(Boolean)[0];
  return validRoots.includes(root);
}
