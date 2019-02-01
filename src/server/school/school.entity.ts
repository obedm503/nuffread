import { IsNotEmpty } from 'class-validator';
import { BaseEntity, Column, Entity, OneToMany, Unique } from 'typeorm';
import { Listing } from '../listing/listing.entity';
import { Created, PrimaryKey, Updated } from '../util/db';

@Entity()
@Unique(['name'])
export class School extends BaseEntity {
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
