import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResetPasswordToken1572202394307 implements MigrationInterface {
  name = 'ResetPasswordToken1572202394307';

  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "password_reset_token" character varying`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_a53e5d9ab118cc964318b3f7297" UNIQUE ("password_reset_token")`,
      undefined,
    );
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_a53e5d9ab118cc964318b3f7297"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "password_reset_token"`,
      undefined,
    );
  }
}
