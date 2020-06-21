import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import * as crypto from 'crypto';
import { BeforeInsert, Column, Entity, PrimaryColumn, Unique } from 'typeorm';
import { promisify } from 'util';
import { Base, Created } from '../util';
import { IsEdu } from '../util';
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
    this.code = buffer.toString('hex');
  }

  @Column({ nullable: true })
  @IsDate()
  @IsOptional()
  invitedAt?: Date;
}
