import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export const PrimaryKey = () => PrimaryGeneratedColumn('uuid');
export const Created = () =>
  CreateDateColumn({
    type: 'timestamp with time zone',
  });
export const Updated = () =>
  UpdateDateColumn({
    type: 'timestamp with time zone',
  });
