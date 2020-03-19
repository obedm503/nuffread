import { MigrationInterface, QueryRunner } from 'typeorm';

export class MarkListingSold1584308024694 implements MigrationInterface {
  name = 'MarkListingSold1584308024694';

  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      'ALTER TABLE "listing" ADD "sold_at" TIMESTAMP WITH TIME ZONE',
    );
    await queryRunner.query('ALTER TABLE "listing" ADD "sold_price" integer');
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query('ALTER TABLE "listing" DROP COLUMN "sold_at"');
    await queryRunner.query('ALTER TABLE "listing" DROP COLUMN "sold_price"');
  }
}
