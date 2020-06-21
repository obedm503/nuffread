import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
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
import { validate } from '../../util';
import { Base, Created, PrimaryKey, Updated } from '../util';
import { Listing } from './listing';
import { RecentListing } from './recent-listing';
import { SavedListing } from './saved-listing';
import { School } from './school';
import { IsEdu, IsInstance } from '../util';

class EmailPassword {
  @IsEmail(undefined, { message: 'must be valid school email' })
  @IsEdu({ message: 'must be valid school email' })
  @MaxLength(255, { message: 'must be at most 255 characters long' })
  email: string;

  @Matches(/\d+/, { message: 'must contain at least 1 number' })
  @MinLength(8, { message: 'must be at least 8 characters long' })
  @MaxLength(32, { message: 'must be at most 32 characters long' })
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
  @IsEmail()
  @IsEdu({ message: 'email must be valid school email' })
  @MaxLength(255)
  email: string;

  @Column()
  @IsString()
  passwordHash: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  confirmCode?: string;

  @Column({ nullable: true })
  @IsDate()
  @IsOptional()
  confirmedAt?: Date;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  photo?: string;

  @OneToMany(() => Listing, listing => listing.user)
  listings: Listing[];

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  passwordResetToken?: string;

  @OneToMany(() => RecentListing, recent => recent.user)
  recent: RecentListing[];

  @OneToMany(() => SavedListing, saved => saved.user)
  saved: SavedListing[];

  @Column()
  @IsString()
  schoolId: string;

  @ManyToOne(() => School, school => school.users)
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
