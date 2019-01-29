import {
  IsInstance,
  IsISBN,
  IsNotEmpty,
  IsString,
  IsUrl,
  IsNumber,
} from 'class-validator';
import { Column, Entity } from 'typeorm';
import { Created, PrimaryKey, Updated } from '../util/config';

@Entity()
export class Listing {
  @PrimaryKey()
  readonly id: string;

  @Created()
  readonly createdAt: Date;

  @Updated()
  readonly updatedAt: Date;

  @Column({ type: 'simple-array' })
  @IsISBN(undefined, { each: true })
  @IsNotEmpty()
  isbn: string[];

  @Column()
  @IsNotEmpty()
  @IsUrl()
  thumbnail: string;

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

  @Column()
  @IsNotEmpty()
  @IsInstance(Date)
  publishedAt: Date;

  @Column()
  @IsNotEmpty()
  @IsString()
  publisher: string;

  @Column()
  @IsNumber()
  price: number;
}
