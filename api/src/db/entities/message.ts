import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Base, Created, PrimaryKey } from '../util';
import { Thread } from './thread';
import { User } from './user';
import { IsInstance } from '../util';

@Entity()
export class Message extends Base {
  @PrimaryKey()
  readonly id: string;

  @Created()
  readonly createdAt: Date;

  @Column()
  @IsString()
  readonly threadId: string;

  @ManyToOne(() => Thread, thread => thread.messages)
  @JoinColumn({ name: 'thread_id' })
  @IsInstance(() => Thread)
  @IsOptional()
  readonly thread: Thread;

  @Column()
  @IsString()
  readonly fromId: string;

  @ManyToOne(() => User)
  @IsInstance(() => User)
  @IsOptional()
  readonly from: User;

  @Column()
  @IsString()
  readonly toId: string;

  @ManyToOne(() => User)
  @IsInstance(() => User)
  @IsOptional()
  readonly to: User;

  @Column({ type: 'text' })
  @IsString()
  @MaxLength(300)
  readonly content: string;
}
