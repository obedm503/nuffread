import { Book, Listing } from '../entities';
import { IBook } from '../schema.gql';
import { IResolver } from '../util/types';

export const BookResolver: IResolver<IBook, Book> = {
  async listings({ id }) {
    return Listing.find({ where: { bookId: id } });
  },
};
