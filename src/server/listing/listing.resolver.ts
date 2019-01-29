import { Query, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { IContext } from '../util';
import { books } from './books';
import { ListingService } from './listing.service';

const includes = (a: string, b: string) => {
  a = a.trim().toLowerCase();
  b = b.trim().toLowerCase();

  return a.includes(b) || b.includes(a);
};

@Resolver('Listing')
export class ListingResolver {
  constructor(private readonly service: ListingService) {}

  @Query()
  search(
    req: Request,
    { query, maxPrice, minPrice }: GQL.ISearchOnQueryArguments,
    ctx: IContext,
  ) {
    if (!query) {
      return books;
    }

    let filtered = books.filter(b => {
      if (b.isbn.find(code => includes(code, query))) {
        return true;
      }
      if (includes(b.title, query)) {
        return true;
      }
      if (b.subTitle && includes(b.subTitle, query)) {
        return true;
      }
      if (b.authors.find(a => includes(a, query))) {
        return true;
      }
      if (b.publisher && includes(b.publisher, query)) {
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
  }
}
