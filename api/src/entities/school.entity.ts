import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { Listing } from './listing.entity';
import { Base, Created, PrimaryKey, Updated } from '../util/db';

@Entity()
@Unique(['name'])
export class School extends Base {
  @PrimaryKey()
  readonly id: string;

  @Created()
  readonly createdAt: Date;

  @Updated()
  readonly updatedAt: Date;

  @Column()
  @IsNotEmpty()
  name: string;

  @OneToMany(() => Listing, listing => listing.school)
  listings: Listing[];
}
