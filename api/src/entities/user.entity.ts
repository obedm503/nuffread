import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm';
import { IsEdu, IsInstance, validate } from '../util';
import { Base, Created, PrimaryKey, Updated } from '../util/db';
import { Invite } from './invite.entity';
import { Listing } from './listing.entity';
import { RecentListing } from './recent-listing.entity';
import { SavedListing } from './saved-listing.entity';
import { School } from './school.entity';

class EmailPassword {
  @IsNotEmpty()
  @IsEmail(undefined, { message: 'must be valid school email' })
  @IsEdu({ message: 'must be valid school email' })
  email: string;

  @IsNotEmpty()
  @Matches(/\d+/, { message: 'must contain at least 1 number' })
  @MinLength(8, { message: 'must be at least 8 characters long' })
  password: string;

  constructor({ email, password }: { email: string; password: string }) {
    this.email = email;
    this.password = password;
  }
}

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

  @OneToMany(
    () => Listing,
    listing => listing.user,
  )
  listings: Listing[];

  @OneToOne(
    () => Invite,
    invite => invite.user,
  )
  @JoinColumn({ name: 'email', referencedColumnName: 'email' })
  invite: Invite;

  @Column({ nullable: true })
  @IsString()
  passwordResetToken?: string;

  @OneToMany(
    () => RecentListing,
    recent => recent.user,
  )
  recent: RecentListing[];

  @OneToMany(
    () => SavedListing,
    saved => saved.user,
  )
  saved: SavedListing[];

  @Column()
  @IsString()
  schoolId: string;

  @ManyToOne(
    () => School,
    school => school.users,
  )
  @JoinColumn({ name: 'school_id' })
  @IsNotEmpty()
  @IsInstance(() => School)
  school: School;

  static validateEmailPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<void> {
    return validate(new EmailPassword({ email, password }));
  }
}
