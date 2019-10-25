import { ServerError, ServerParseError } from 'apollo-link-http-common';
import { GraphQLError } from 'graphql';
import mixpanel from 'mixpanel-browser';

const isProd = process.env.NODE_ENV === 'production';

const track = !!process.env.REACT_APP_MIXPANEL_TOKEN;

if (track) {
  mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN!, {
    api_host: isProd ? 'https://api.mixpanel.com' : 'http://api.mixpanel.com',
  });
}

type ErrorEventsMap = {
  SYNC_ERROR:
    | { error: string }
    | {
        source?: string;
        lineno?: number;
        colno?: number;
        error?: Error;
        stack?: string;
      };
  ASYNC_ERROR: { reason };
  RENDER_ERROR: {
    name: string;
    message: string;
    stack?: string;
    componentStack: string;
  };
  NETWORK_ERROR: { error: Error | ServerError | ServerParseError };
  GRAPHQL_ERROR: { errors: readonly GraphQLError[] };
};
type AppEvents = {
  NAVIGATE: { to: string };
};
type EventsMap = ErrorEventsMap & AppEvents;

const log = isProd ? ((() => {}) as typeof console.log) : console.log;

export const tracker = {
  login(id: string) {
    log('identify', id);
    if (track) {
      mixpanel.identify(id);
    }
  },
  invite(email: string) {
    log('invite', { email });
    if (track) {
      mixpanel.identify(email);
      mixpanel.track('REQUEST_INVITE', { email });
    }
  },
  register(id: string, email: string) {
    log('register', id, { email });
    if (track) {
      mixpanel.alias(id, email);
      mixpanel.people.set({ email });
    }
  },
  logout() {
    log('logout');
    if (track) {
      mixpanel.reset();
    }
  },
  event<K extends keyof EventsMap>(event: K, details: EventsMap[K]) {
    log('event', event, details);
    if (track) {
      mixpanel.track(event, details);
    }
  },
};

window.onerror = (
  event: Event | string,
  source?: string,
  lineno?: number,
  colno?: number,
  error?: Error,
) => {
  if (typeof event == 'string') {
    tracker.event('SYNC_ERROR', {
      error: event,
    });
  } else {
    event.preventDefault();

    tracker.event('SYNC_ERROR', {
      source,
      lineno,
      colno,
      error,
      stack: error && error.stack,
    });
  }
  return false;
};

const handleRejections = event => {
  if (!event.reason) {
    // promise rejected with nothing
    return;
  }
  event.preventDefault();

  if (event.reason.graphQLErrors || event.reason.networkError) {
    // apollo errors are handled by the error link
    return;
  }
  tracker.event('ASYNC_ERROR', {
    reason: event.reason,
  });
};
window.addEventListener('unhandledrejection', handleRejections);

if (module['hot']) {
  module['hot'].dispose(() => {
    window.removeEventListener('unhandledrejection', handleRejections);
    window.onerror = null;
  });
}

// better error logging
if (!('toJSON' in Error.prototype)) {
  // eslint-disable-next-line
  Error.prototype['toJSON'] = function() {
    const e = {};

    Object.getOwnPropertyNames(this).forEach(key => {
      e[key] = this[key];
    });

    return e;
  };
}
