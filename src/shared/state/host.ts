import { createContext } from 'react';

const { Provider, Consumer } = createContext<string | undefined>(undefined);

export { Provider as HostProvider, Consumer as HostConsumer };
