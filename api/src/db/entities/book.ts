import { IsISBN, IsOptional, IsString, IsUrl } from 'class-validator';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Base, Created, PrimaryKey, Updated } from '../util';
import { Listing } from './listing';
import { IsInstance } from '../util';

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
  @IsString()
  googleId?: string;

  @Column({ nullable: true })
  @IsString()
  etag?: string;

  @Column({ type: 'simple-array' })
  @IsISBN(undefined, { each: true })
  isbn: string[];

  @Column({ nullable: true })
  @IsUrl()
  thumbnail?: string;

  @Column()
  @IsString()
  title: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  subTitle?: string;

  @Column({ type: 'simple-array' })
  @IsString({ each: true })
  authors: string[];

  @Column({ nullable: true })
  @IsInstance(() => Date)
  @IsOptional()
  publishedAt?: Date;

  @OneToMany(() => Listing, listing => listing.book)
  listings: Listing[];

  // for full-text search
  @Column({ type: 'text', select: false, default: '' })
  private search_text: string;
}
