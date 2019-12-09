import { RouteProps } from 'react-router';

export type RootPageProps = { globalRoutes: readonly RouteProps[] };

/** @param {T} T cannot of type boolean */
export type Optional<T> = T extends boolean ? unknown : T | false;
