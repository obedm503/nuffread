import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserCanDisableTracking1577752315658 implements MigrationInterface {
  name = 'UserCanDisableTracking1577752315658';

  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      'ALTER TABLE "user" ADD "is_trackable" boolean NOT NULL DEFAULT true',
    );
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "is_trackable"');
  }
}
