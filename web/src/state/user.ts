import { createContext, useContext } from 'react';
import { ISystemUser } from '../schema.gql';

const UserContext = createContext<ISystemUser | undefined>(undefined);
export const UserProvider = UserContext.Provider;
export function useUser() {
  return useContext(UserContext);
}

export function useLoggedIn(): boolean {
  return !!useUser();
}

export function useIsAdmin() {
  const me = useUser();

  return (
    me?.__typename === 'User' &&
    (me.email === 'bdmrnddr@dordt.edu' ||
      me.email === 'nam33@students.calvin.edu')
  );
}
