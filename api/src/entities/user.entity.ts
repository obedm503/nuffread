import { IsDate, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm';
import { IsEdu } from '../util';
import { Base, Created, PrimaryKey, Updated } from '../util/db';
import { Invite } from './invite.entity';
import { Listing } from './listing.entity';

@Entity()
@Unique(['email'])
@Unique(['passwordResetToken'])
export class User extends Base {
  @PrimaryKey()
  readonly id: string;

  @Created()
  readonly createdAt: Date;

  @Updated()
  readonly updatedAt: Date;

  @Column()
  @IsNotEmpty()
  @IsEmail()
  @IsEdu({ message: 'email must be valid school email' })
  email: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  passwordHash: string;

  @Column({ nullable: true })
  @IsDate()
  confirmedAt?: Date;

  @Column({ nullable: true })
  @IsString()
  name?: string;

  @Column({ nullable: true })
  @IsString()
  photo?: string;

  @OneToMany(() => Listing, listing => listing.user)
  listings: Listing[];

  @OneToOne(() => Invite, invite => invite.user)
  @JoinColumn({ name: 'email', referencedColumnName: 'email' })
  invite: Invite;

  @Column({ nullable: true })
  @IsString()
  passwordResetToken?: string;
}
