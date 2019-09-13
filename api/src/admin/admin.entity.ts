import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, Unique } from 'typeorm';
import { Base, Created, PrimaryKey, Updated } from '../util/db';

@Entity()
@Unique(['email'])
export class Admin extends Base {
  @PrimaryKey()
  readonly id: string;

  @Created()
  readonly createdAt: Date;

  @Updated()
  readonly updatedAt: Date;

  @Column()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  passwordHash: string;
}
