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
