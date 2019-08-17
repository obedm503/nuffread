import {
  IsInstance,
  IsISBN,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';
import { BaseEntity, Column, Entity, Index, OneToMany } from 'typeorm';
import { Listing } from '../listing/listing.entity';
import { Created, PrimaryKey, Updated } from '../util/db';

@Entity()
@Index('book_search_text_idx', { synchronize: false }) // handled by migration
export class Book extends BaseEntity {
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
  @IsInstance(Date)
  publishedAt?: Date;

  @OneToMany(() => Listing, listing => listing.book)
  listings: Listing[];

  // for full-text search
  @Column({ type: 'text', select: false, default: '' })
  private search_text: string;
}
