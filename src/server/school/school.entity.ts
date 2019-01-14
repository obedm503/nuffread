import { IsNotEmpty } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Seller } from '../seller/seller.entity';

@Entity()
@Unique(['name'])
export class School {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  readonly createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  readonly updatedAt: Date;

  @Column()
  @IsNotEmpty()
  name: string;

  @OneToMany(() => Seller, seller => seller.school)
  users: Seller[];
}
