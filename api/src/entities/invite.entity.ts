import { IsDate, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import * as crypto from 'crypto';
import {
  BeforeInsert,
  Column,
  Entity,
  OneToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { promisify } from 'util';
import { IsEdu } from '../util';
import { Base, Created } from '../util/db';
import { User } from './user.entity';

const randomBytes = promisify(crypto.randomBytes);

@Entity()
@Unique(['code'])
export class Invite extends Base {
  @Created()
  readonly createdAt: Date;

  @PrimaryColumn()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @IsEdu()
  email: string;

  @OneToOne(() => User, user => user.invite, { nullable: true })
  user?: User;

  @Column()
  @IsNotEmpty()
  @IsString()
  code: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  name: string;

  @BeforeInsert()
  private async addCode() {
    const buffer = await randomBytes(48);
    this.code = buffer.toString('base64');
  }

  @Column({ nullable: true })
  @IsDate()
  invitedAt?: Date;
}
