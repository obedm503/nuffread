import { ServerError, ServerParseError } from 'apollo-link-http-common';
import { GraphQLError } from 'graphql';
import mixpanel from 'mixpanel-browser';
import { ErrorInfo } from 'react';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  mixpanel.init(process.env.REACT_APP_MIXPANEL_KEY!);
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
  RENDER_ERROR: { error: Error; info: ErrorInfo };
  NETWORK_ERROR: { error: Error | ServerError | ServerParseError };
  GRAPHQL_ERROR: { errors: readonly GraphQLError[] };
};

type EventsMap = ErrorEventsMap & { NAVIGATE: { to: string } };

export const tracker = {
  identify(id: string) {
    if (!isProd) {
      console.log('identify', id);
      return;
    }
    mixpanel.identify(id);
  },
  alias(id: string) {
    if (!isProd) {
      console.log('alias', id);
      return;
    }
    mixpanel.alias(id);
  },
  event<K extends keyof EventsMap>(event: K, details: EventsMap[K]) {
    if (!isProd) {
      console.log('event', event, details);
      return;
    }
    mixpanel.track(event, details);
  },
  people(details: Record<string, any>) {
    if (!isProd) {
      console.log('people', details);
      return;
    }
    mixpanel.people.set(details);
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
