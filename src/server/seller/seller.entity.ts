import { IsEmail, IsInstance, IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { School } from '../school/school.entity';
import { Created, PrimaryKey, Updated } from '../util/config';

@Entity()
@Unique(['email'])
@Unique(['schoolId'])
export class Seller {
  @PrimaryKey()
  readonly id: string;

  @Created()
  readonly createdAt: Date;

  @Updated()
  readonly updatedAt: Date;

  @Column()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  passwordHash: string;

  @Column({ nullable: true })
  @IsString()
  photo?: string;

  // @Column({ type: 'varchar', nullable: true })
  // @IsNotEmpty()
  // googleId?: string;

  // @Column({ type: 'simple-array' /*, enum: Scopes, array: true */ })
  // @IsEnum(Scopes, { each: true })
  // scopes: string[];

  @Column()
  @IsString()
  schoolId: string;

  @ManyToOne(() => School, school => school.users)
  @JoinColumn({ name: 'school_id' })
  @IsNotEmpty()
  @IsInstance(School)
  school: School;
}
