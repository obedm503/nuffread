import { IsEmail, IsString, MaxLength } from 'class-validator';
import { Column, Entity, Unique } from 'typeorm';
import { Base, Created, PrimaryKey, Updated } from '../util';

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
  @MaxLength(255)
  email: string;

  @Column()
  @IsString()
  passwordHash: string;
}
