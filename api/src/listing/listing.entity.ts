import {
  IsInstance,
  IsISBN,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
} from 'class-validator';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { School } from '../school/school.entity';
import { Seller } from '../seller/seller.entity';
import { Created, PrimaryKey, Updated } from '../util/db';

@Entity()
export class Listing extends BaseEntity {
  @PrimaryKey()
  readonly id: string;

  @Created()
  readonly createdAt: Date;

  @Updated()
  readonly updatedAt: Date;

  @Column()
  @IsNotEmpty()
  @IsString()
  googleId: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  etag: string;

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

  @Column()
  @IsNumber()
  price: number;

  @Column()
  schoolId: string;

  @ManyToOne(() => School, school => school.listings)
  @JoinColumn({ name: 'school_id' })
  @IsNotEmpty()
  @IsInstance(School)
  school: School;

  @Column()
  sellerId: string;

  @ManyToOne(() => Seller, seller => seller.listings)
  @JoinColumn({ name: 'seller_id' })
  @IsNotEmpty()
  @IsInstance(Seller)
  seller: Seller;

  // for full-text search
  @Column('tsvector', { select: false })
  private document_with_weights: any;
}
