import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddListingCondition1589482004085 implements MigrationInterface {
  name = 'AddListingCondition1589482004085';

  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      `CREATE TYPE "listing_condition_enum" AS ENUM('NEW', 'LIKE_NEW', 'VERY_GOOD', 'GOOD', 'ACCEPTABLE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "condition" "listing_condition_enum"`,
    );
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "condition"`);
    await queryRunner.query(`DROP TYPE "listing_condition_enum"`);
  }
}
