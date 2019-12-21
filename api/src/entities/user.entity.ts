import { IsDate, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm';
import { IsEdu, IsInstance } from '../util';
import { Base, Created, PrimaryKey, Updated } from '../util/db';
import { Invite } from './invite.entity';
import { Listing } from './listing.entity';
import { RecentListing } from './recent-listing.entity';
import { SavedListing } from './saved-listing.entity';
import { School } from './school.entity';

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
}
