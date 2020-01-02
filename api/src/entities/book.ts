import { IsISBN, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { IsInstance } from '../util';
import { Base, Created, PrimaryKey, Updated } from '../util/db';
import { Listing } from './listing';

@Entity()
@Index('book_search_text_idx', { synchronize: false }) // handled by migration
export class Book extends Base {
  @PrimaryKey()
  readonly id: string;

  @Created()
  readonly createdAt: Date;

  @Updated()
  readonly updatedAt: Date;

  @Column({ nullable: true })
  @IsNotEmpty()
  @IsString()
  googleId?: string;

  @Column({ nullable: true })
  @IsNotEmpty()
  @IsString()
  etag?: string;

  @Column({ type: 'simple-array' })
  @IsISBN(undefined, { each: true })
  @IsNotEmpty()
  isbn: string[];

  @Column({ nullable: true })
  @IsNotEmpty()
  @IsUrl()
  thumbnail?: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Column({ nullable: true })
  @IsString()
  subTitle?: string;

  @Column({ type: 'simple-array' })
  @IsNotEmpty()
  @IsString({ each: true })
  authors: string[];

  @Column({ nullable: true })
  @IsInstance(() => Date)
  publishedAt?: Date;

  @OneToMany(
    () => Listing,
    listing => listing.book,
  )
  listings: Listing[];

  // for full-text search
  @Column({ type: 'text', select: false, default: '' })
  private search_text: string;
}
