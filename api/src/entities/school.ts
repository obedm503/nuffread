import { IsString, MaxLength } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import { IsEdu } from '../util';
import { Base, Created, PrimaryKey, Updated } from '../util/db';
import { User } from './user';

@Entity()
export class School extends Base {
  @PrimaryKey()
  readonly id: string;

  @Created()
  readonly createdAt: Date;

  @Updated()
  readonly updatedAt: Date;

  @Column()
  @IsString()
  @MaxLength(255)
  name: string;

  @Column()
  @IsString()
  @IsEdu()
  @MaxLength(255)
  domain: string;

  @OneToMany(() => User, user => user.school)
  users: User[];
}
