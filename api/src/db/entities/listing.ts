import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ListingCondition } from '../../graphql';
import { Base, Created, IsInstance, PrimaryKey, Updated } from '../util';
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

  @ManyToOne(() => Book, book => book.listings)
  @JoinColumn({ name: 'book_id' })
  @IsInstance(() => Book)
  book: Book;

  @Column()
  @IsInt()
  @IsPositive()
  price: number;

  @Column()
  @IsString()
  userId: string;

  @ManyToOne(() => User, user => user.listings)
  @JoinColumn({ name: 'user_id' })
  @IsInstance(() => User)
  user: User;

  // give recommendations based on books used for the same class
  // give recommendations based on books bought by other people who also bought this one
  @Column({ default: '' })
  @MaxLength(300)
  description: string;

  @Column()
  isPublic: boolean = false;

  // for full-text search
  @Column({ type: 'text', select: false, default: '' })
  private search_text: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  @IsDate()
  @IsOptional()
  soldAt?: Date;

  @Column({ nullable: true })
  @IsInt()
  @IsPositive()
  @IsOptional()
  soldPrice?: number;

  @Column({
    type: 'enum',
    enum: ListingCondition,
    nullable: true,
  })
  @IsEnum(ListingCondition)
  @IsOptional()
  condition?: ListingCondition;
}
