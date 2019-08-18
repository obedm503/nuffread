import { useContext, createContext } from 'react';
import { SystemUser } from '../schema.gql';

export type UserState = SystemUser | undefined;

const UserContext = createContext<UserState>(undefined);
export const UserProvider = UserContext.Provider;
export function useUser() {
  return useContext(UserContext);
}
