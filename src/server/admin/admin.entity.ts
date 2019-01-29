import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, Unique } from 'typeorm';
import { Created, PrimaryKey, Updated } from '../util/config';

@Entity()
@Unique(['email'])
export class Admin {
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
