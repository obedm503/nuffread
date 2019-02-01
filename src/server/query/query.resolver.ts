import { AuthenticationError } from 'apollo-server-core';
import { compare } from 'bcryptjs';
import { Admin } from '../admin/admin.entity';
import { books } from '../listing/books';
import { Seller } from '../seller/seller.entity';
import { sign } from '../util/jwt';
import { IResolver } from '../util/types';

const search = (a: string, b: string) => {
  a = a.trim().toLowerCase();
  b = b.trim().toLowerCase();

  return a.includes(b) || b.includes(a);
};

export const QueryResolver: IResolver<GQL.IQuery> = {
  search(_, { query, maxPrice, minPrice }: GQL.ISearchOnQueryArguments) {
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

  async me(_, args, { user }) {
    if (!user) {
      throw new AuthenticationError('Unknown type');
    }
    return (user as any) as GQL.User;
  },

  async login(_, { email, password, type }: GQL.ILoginOnQueryArguments) {
    let Ent: typeof Admin | typeof Seller;
    if (type === 'SELLER') {
      Ent = Seller;
    } else if (type === 'ADMIN') {
      Ent = Admin;
    } else {
      throw new AuthenticationError('Unknown type');
    }

    const user = await Ent.findOne({ email });

    if (!user) {
      throw new AuthenticationError('Wrong email or password');
    }

    if (!(await compare(password, user.passwordHash))) {
      throw new AuthenticationError('Wrong email or password');
    }

    const token = await sign({ email, id: user.id, type });
    return token;
  },
};
