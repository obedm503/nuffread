import { ServerError, ServerParseError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import mixpanel from 'mixpanel-browser';

const isProd = process.env.NODE_ENV === 'production';

const track = !!process.env.REACT_APP_MIXPANEL_TOKEN;
const version = process.env.REACT_APP_VERSION!;

console.info('App version: ' + version);

if (track) {
  mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN!, {
    api_host: isProd ? 'https://api.mixpanel.com' : 'http://api.mixpanel.com',
    opt_out_tracking_persistence_type: 'localStorage',
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
  NAVIGATE: { to: string; from: string };
  CREATE_LISTING: { price: number };
  REQUEST_RESET_PASSWORD: { email: string };
  RESET_PASSWORD: {};
  CONFIRM_EMAIL: {};
  SAVE_POST: { listingId: string };
  UNSAVE_POST: { listingId: string };
  START_THREAD: { listingId: string };
};
type EventsMap = ErrorEventsMap & AppEvents;

const log: typeof console.log = isProd ? () => {} : console.log;

export const tracker = {
  enable(canTrack: boolean): void {
    if (!track) {
      return;
    }
    if (canTrack) {
      mixpanel.opt_in_tracking();
    } else {
      mixpanel.opt_out_tracking();
    }
  },
  identify({ email }: { email: string }) {
    log('identify', email);
    if (track) {
      mixpanel.identify(email);
      mixpanel.people.set({ $last_login: new Date(), $email: email });
    }
  },
  login({ email }: { email: string }) {
    log('login', { email });
    if (track) {
      mixpanel.track('LOGIN', { email, version });
    }
  },
  invite({ email }: { email: string }) {
    log('invite', { email });
    if (track) {
      mixpanel.alias(email);
      mixpanel.people.set({ $created: new Date(), $email: email });
      mixpanel.track('REQUEST_INVITE', { email, version });
    }
  },
  register({ email }: { email: string }) {
    log('register', email);
    if (track) {
      mixpanel.identify(email);
      mixpanel.track('REGISTER', { email, version });
    }
  },
  logout() {
    log('logout');
    if (track) {
      mixpanel.track('LOGOUT', { version });
      mixpanel.reset();
    }
  },
  event<K extends keyof EventsMap>(event: K, details: EventsMap[K]): void {
    log('event', event, details);
    if (track) {
      mixpanel.track(event, { ...details, version });
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
      stack: error?.stack,
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
  Error.prototype['toJSON'] = function () {
    const e = {};

    Object.getOwnPropertyNames(this).forEach(key => {
      e[key] = this[key];
    });

    return e;
  };
}
