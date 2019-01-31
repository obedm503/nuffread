import {
  IsInstance,
  IsISBN,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
} from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { School } from '../school/school.entity';
import { Created, PrimaryKey, Updated } from '../util/config';

@Entity()
@Unique(['schoolId'])
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

  @Column()
  @IsString()
  schoolId: string;

  @ManyToOne(() => School, school => school.listings)
  @JoinColumn({ name: 'school_id' })
  @IsNotEmpty()
  @IsInstance(School)
  school: School;
}
