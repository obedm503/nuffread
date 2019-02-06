import {
  IsEmail,
  IsNotEmpty,
  IsString,
  registerDecorator,
  ValidationOptions,
  IsDate,
} from 'class-validator';
import { BaseEntity, Column, Entity, Unique } from 'typeorm';
import { Created, PrimaryKey, Updated } from '../util/db';

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
}
