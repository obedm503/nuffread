import { Request } from 'express';
import { books } from '../listing/books';
import { IResolver } from '../util/types';

const search = (a: string, b: string) => {
  a = a.trim().toLowerCase();
  b = b.trim().toLowerCase();

  return a.includes(b) || b.includes(a);
};

export const QueryResolver: IResolver<GQL.IQuery, Request> = {
  search(req, { query, maxPrice, minPrice }: GQL.ISearchOnQueryArguments, ctx) {
    if (!query) {
      return books;
    }

    let filtered = books.filter(b => {
      if (b.isbn.find(code => search(code, query))) {
        return true;
      }
      if (search(b.title, query)) {
        return true;
      }
      if (b.subTitle && search(b.subTitle, query)) {
        return true;
      }
      if (b.authors.find(a => search(a, query))) {
        return true;
      }
      if (b.publisher && search(b.publisher, query)) {
        return true;
      }
    });

    if (minPrice || maxPrice) {
      filtered = filtered.filter(b => {
        if (minPrice && !maxPrice) {
          return b.price >= minPrice;
        }
        if (!minPrice && maxPrice) {
          return b.price <= maxPrice;
        }
        if (minPrice && maxPrice) {
          return minPrice <= b.price && b.price <= maxPrice;
        }
      });
    }
    return filtered;
  },

  async me(req, args, { user }) {
    if (!user) {
      return null;
    }
    return (user as any) as GQL.User;
  },
};
