import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSchoolEntity1571436590191 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP CONSTRAINT "FK_ce22052d6cf5d143cde3346f0ea"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "school_id"`);
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "school_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD CONSTRAINT "FK_ce22052d6cf5d143cde3346f0ea" FOREIGN KEY ("school_id") REFERENCES "school"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
