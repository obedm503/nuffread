import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { IsInstance } from '../util';
import { Base, Created, PrimaryKey, Updated } from '../util/db';
import { Book } from './book';
import { User } from './user';

@Entity()
@Index('listing_search_text_idx', { synchronize: false }) // handled by migration
export class Listing extends Base {
  @PrimaryKey()
  readonly id: string;

  @Created()
  readonly createdAt: Date;

  @Updated()
  readonly updatedAt: Date;

  @Column()
  @IsString()
  bookId: string;

  @ManyToOne(
    () => Book,
    book => book.listings,
  )
  @JoinColumn({ name: 'book_id' })
  @IsNotEmpty()
  @IsInstance(() => Book)
  book: Book;

  @Column()
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  price: number;

  @Column()
  @IsString()
  userId: string;

  @ManyToOne(
    () => User,
    user => user.listings,
  )
  @JoinColumn({ name: 'user_id' })
  @IsNotEmpty()
  @IsInstance(() => User)
  user: User;

  // give recommendations based on books used for the same class
  // give recommendations based on books bought by other people who also bought this one
  @Column({ default: '' })
  description: string;

  @Column()
  isPublic: boolean = false;

  // for full-text search
  @Column({ type: 'text', select: false, default: '' })
  private search_text: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  @IsDate()
  soldAt?: Date;

  @Column({ nullable: true })
  @IsInt()
  @IsPositive()
  soldPrice?: number;

  @Column({
    nullable: true,
    type: 'enum',
    enum: ListingCondition,
  })
  @IsEnum(ListingCondition)
  condition?: ListingCondition;
}
