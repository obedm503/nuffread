import { ExpressContext } from 'apollo-server-express';
import DataLoader from 'dataloader';
import { Base } from '../db';
import {
  Admin,
  Book,
  Listing,
  SavedListing,
  School,
  Thread,
  User,
} from '../db/entities';
import { IContext, Session } from '../types';
import { logger } from '../util';
import { SystemUserType } from './schema.gql';

function lazy<T>(factory: () => T) {
  let value: T;
  return () => {
    if (!value) {
      value = factory();
    }
    return value;
  };
}

function makeIdLoader<E extends typeof Base>(
  Entity: E,
): DataLoader<string, InstanceType<E> | undefined, string> {
  return new DataLoader(async (ids: readonly string[]) => {
    logger.debug(`data-loader ${Entity.name}`, ids);
    const items: any[] = await Entity.findByIds(ids.slice(0));
    return ids.map(id => items.find(item => item['id'] === id));
  });
}
function makeEmailLoader<E extends typeof Base>(
  Entity: E,
): DataLoader<string, InstanceType<E> | undefined, string> {
  return new DataLoader(async (emails: readonly string[]) => {
    logger.debug(`data-loader ${Entity.name}`, emails);
    const items: any[] = await Entity.find({
      where: emails.map(email => ({ email })),
    });
    return emails.map(email => items.find(item => item['email'] === email));
  });
}

export async function getContext({
  session,
  req,
  res,
}: {
  session?: Session;
  req?: ExpressContext['req'];
  res?: ExpressContext['res'];
}): Promise<IContext> {
  const adminLoader = lazy(() => makeIdLoader(Admin));
  const userLoader = lazy(() => makeIdLoader(User));

  return {
    getMe: async () => {
      if (!session) {
        return;
      }

      const id = session.userId;
      const type = session.userType;
      if (!id || !type) {
        return;
      }
      if (type === SystemUserType.User) {
        return userLoader().load(id);
      }
      if (type === SystemUserType.Admin) {
        return adminLoader().load(id);
      }
    },
    req,
    res,
    session,
    adminLoader,
    bookLoader: lazy(() => makeIdLoader(Book)),
    listingLoader: lazy(() => makeIdLoader(Listing)),
    savedListingLoader: lazy(() => {
      return new DataLoader(async (ids: readonly string[]) => {
        // in format listingId::userId
        logger.debug(`data-loader ${SavedListing.name}`, ids);

        const items = await SavedListing.find({
          where: ids.map(id => {
            const [listingId, userId] = id.split('::');
            return { listingId, userId };
          }),
        });

        return ids.map(id => {
          const [listingId, userId] = id.split('::');

          return items.find(
            item => item.listingId === listingId && item.userId === userId,
          );
        });
      });
    }),
    schoolLoader: lazy(() => makeIdLoader(School)),
    threadLoader: lazy(() => makeIdLoader(Thread)),
    userEmailLoader: lazy(() => makeEmailLoader(User)),
    userLoader,
  };
}
