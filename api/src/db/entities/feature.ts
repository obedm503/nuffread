import { IsEnum, IsOptional } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { FeatureLevel } from '../../graphql/schema.gql';
import { Base, Created, PrimaryKey, Updated } from '../util';

@Entity()
export class Feature extends Base {
  @PrimaryKey()
  readonly id: string;

  @Created()
  readonly createdAt: Date;

  @Updated()
  readonly updatedAt: Date;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: FeatureLevel,
  })
  @IsEnum(FeatureLevel)
  @IsOptional()
  level: FeatureLevel;
}
