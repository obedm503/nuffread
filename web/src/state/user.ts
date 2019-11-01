import { createContext, useContext } from 'react';
import { ISystemUser } from '../schema.gql';

export type UserState = ISystemUser | undefined;

const UserContext = createContext<UserState>(undefined);
export const UserProvider = UserContext.Provider;
export function useUser() {
  return useContext(UserContext);
}
