import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureFlags1595563921393 implements MigrationInterface {
  name = 'AddFeatureFlags1595563921393';

  async up(queryRunner: QueryRunner) {
    await queryRunner.query(`
      CREATE TYPE "feature_level_enum" AS ENUM('NONE', 'ADMIN', 'BETA', 'ALL')
    `);
    await queryRunner.query(`
      CREATE TABLE "feature" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "name" character varying NOT NULL,
        "level" "feature_level_enum" NOT NULL,
        CONSTRAINT "PK_03930932f909ca4be8e33d16a2d" PRIMARY KEY ("id")
      )
    `);
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(`DROP TABLE "feature"`);
    await queryRunner.query(`DROP TYPE "feature_level_enum"`);
  }
}
