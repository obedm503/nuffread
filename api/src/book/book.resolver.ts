import { IBook } from '../schema.gql';
import { IResolver } from '../util/types';
import { Book } from './book.entity';

export const BookResolver: IResolver<IBook, Book> = {};
