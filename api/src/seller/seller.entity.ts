import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { BaseEntity, Column, Entity, OneToMany, Unique } from 'typeorm';
import { Listing } from '../listing/listing.entity';
import { Created, PrimaryKey, Updated } from '../util/db';
import { send } from '../util/email';
const btoa = require('btoa');

export const sendConfirmationEmail = async (
  base: string,
  id: string,
  email: string,
) => {
  const link = `${base}/confirm/${btoa(id)}`;
  await send({
    email,
    subject: 'Click to confirm email',
    html: `Please click the link to confirm your email. <br /><br /> ${link}`,
  });
};

function IsEdu(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEdu',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && value.endsWith('.edu');
        },
      },
    });
  };
}

@Entity()
@Unique(['email'])
export class Seller extends BaseEntity {
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

  @OneToMany(() => Listing, listing => listing.seller)
  listings: Listing[];
}
