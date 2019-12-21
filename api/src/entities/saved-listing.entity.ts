import { IsNotEmpty, IsString } from 'class-validator';
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { IsInstance } from '../util';
import { Base, Created, Updated } from '../util/db';
import { Listing } from './listing.entity';
import { User } from './user.entity';

@Entity()
export class SavedListing extends Base {
  @Created()
  readonly createdAt: Date;

  @Updated()
  readonly updatedAt: Date;

  @PrimaryColumn()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ManyToOne(
    () => User,
    user => user.recent,
  )
  @IsInstance(() => User)
  user: User;

  @PrimaryColumn()
  @IsString()
  @IsNotEmpty()
  listingId: string;

  @ManyToOne(() => Listing)
  @IsInstance(() => Listing)
  listing: Listing;
}
