import { Request } from 'express';
import { IResolverObject } from 'graphql-tools';
import { books } from '../listing/books';
import { IContext } from '../util';

const search = (a: string, b: string) => {
  a = a.trim().toLowerCase();
  b = b.trim().toLowerCase();

  return a.includes(b) || b.includes(a);
};

export const QueryResolver: IResolverObject<Request, IContext> = {
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
};
