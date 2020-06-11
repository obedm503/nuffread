import { IsOptional, IsString } from 'class-validator';
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { IsInstance } from '../util';
import { Base, Created, Updated } from '../util/db';
import { Listing } from './listing';
import { User } from './user';

@Entity()
export class RecentListing extends Base {
  @Created()
  readonly createdAt: Date;

  @Updated()
  readonly updatedAt: Date;

  @PrimaryColumn()
  @IsString()
  userId: string;

  @ManyToOne(() => User, user => user.recent)
  @IsInstance(() => User)
  @IsOptional()
  user: User;

  @PrimaryColumn()
  @IsString()
  listingId: string;

  @ManyToOne(() => Listing)
  @IsInstance(() => Listing)
  @IsOptional()
  listing: Listing;
}
