import { IsOptional, IsString } from 'class-validator';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { IsInstance } from '../util';
import { Base, Created, PrimaryKey } from '../util/db';
import { Listing } from './listing';
import { Message } from './message';
import { User } from './user';

@Entity()
@Index(['sellerId', 'buyerId', 'listingId'])
export class Thread extends Base {
  @PrimaryKey()
  readonly id: string;

  @Created()
  readonly createdAt: Date;

  @Column()
  @IsString()
  readonly sellerId: string;

  @ManyToOne(() => User)
  @IsInstance(() => User)
  @IsOptional()
  readonly seller: User;

  @Column()
  @IsString()
  readonly buyerId: string;

  @ManyToOne(() => User)
  @IsInstance(() => User)
  @IsOptional()
  readonly buyer: User;

  @Column()
  @IsString()
  readonly listingId: string;

  @ManyToOne(() => Listing)
  @IsInstance(() => Listing)
  @IsOptional()
  readonly listing: Listing;

  @OneToMany(() => Message, message => message.thread)
  readonly messages: Message[];

  @Column({
    type: 'timestamp with time zone',
  })
  @IsInstance(() => Date)
  lastMessageAt: Date;
}
