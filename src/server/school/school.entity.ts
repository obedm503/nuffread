import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { Seller } from '../seller/seller.entity';
import { Created, PrimaryKey, Updated } from '../util/config';

@Entity()
@Unique(['name'])
export class School {
  @PrimaryKey()
  readonly id: string;

  @Created()
  readonly createdAt: Date;

  @Updated()
  readonly updatedAt: Date;

  @Column()
  @IsNotEmpty()
  name: string;

  @OneToMany(() => Seller, seller => seller.school)
  users: Seller[];
}
