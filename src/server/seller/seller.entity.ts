import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { BaseEntity, Column, Entity, Unique } from 'typeorm';
import { Created, PrimaryKey, Updated } from '../util/db';

@Entity()
@Unique(['email'])
export class Seller extends BaseEntity {
  @PrimaryKey()
  readonly id: string;

  @Created()
  readonly createdAt: Date;

  @Updated()
  readonly updatedAt: Date;

  @Column({ nullable: true })
  @IsString()
  name?: string;

  @Column()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  passwordHash: string;

  @Column({ nullable: true })
  @IsString()
  photo?: string;

  // @Column({ type: 'varchar', nullable: true })
  // @IsNotEmpty()
  // googleId?: string;

  // @Column({ type: 'simple-array' /*, enum: Scopes, array: true */ })
  // @IsEnum(Scopes, { each: true })
  // scopes: string[];
}
