import { IsInstance, IsNotEmpty, IsNumber } from 'class-validator';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Book } from '../book/book.entity';
import { School } from '../school/school.entity';
import { User } from '../user/user.entity';
import { Base, Created, PrimaryKey, Updated } from '../util/db';

@Entity()
@Index('listing_search_text_idx', { synchronize: false }) // handled by migration
export class Listing extends Base {
  @PrimaryKey()
  readonly id: string;

  @Created()
  readonly createdAt: Date;

  @Updated()
  readonly updatedAt: Date;

  @Column()
  bookId: string;

  @ManyToOne(() => Book, book => book.listings)
  @JoinColumn({ name: 'book_id' })
  @IsNotEmpty()
  @IsInstance(Book)
  book: Book;

  @Column()
  @IsNumber()
  price: number;

  @Column()
  schoolId: string;

  @ManyToOne(() => School, school => school.listings)
  @JoinColumn({ name: 'school_id' })
  @IsNotEmpty()
  @IsInstance(School)
  school: School;

  @Column()
  userId: string;

  @ManyToOne(() => User, user => user.listings)
  @JoinColumn({ name: 'user_id' })
  @IsNotEmpty()
  @IsInstance(User)
  user: User;

  // give recommendations based on books used for the same class
  // give recommendations based on books bought by other people who also bought this one
  @Column({ default: '' })
  description: string;

  @Column()
  isPublic: boolean = false;

  // for full-text search
  @Column({ type: 'text', select: false, default: '' })
  private search_text: string;
}
