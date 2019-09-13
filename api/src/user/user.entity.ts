import { IsDate, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm';
import { Invite } from '../invite/invite.entity';
import { Listing } from '../listing/listing.entity';
import { Base, Created, IsEdu, PrimaryKey, Updated } from '../util/db';
import { send } from '../util/email';

export const sendConfirmationEmail = async (
  base: string,
  { email, confirmCode }: { email: string; confirmCode: string },
) => {
  const link = `${base}/confirm/${confirmCode}`;
  await send({
    email,
    subject: 'Click to confirm email',
    html: `Please click the link to confirm your email. <br /><br /> ${link}`,
  });
};

@Entity()
@Unique(['email'])
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
}
