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
  Unique,
} from 'typeorm';
import { IsEdu, IsInstance, validate } from '../util';
import { Base, Created, PrimaryKey, Updated } from '../util/db';
import { Listing } from './listing';
import { RecentListing } from './recent-listing';
import { SavedListing } from './saved-listing';
import { School } from './school';

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
@Unique(['confirmCode'])
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
  @IsString()
  confirmCode?: string;

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

  @Column({ default: true })
  isTrackable: boolean = true;
}
