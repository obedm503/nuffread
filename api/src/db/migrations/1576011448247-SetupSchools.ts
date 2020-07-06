import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetupSchools1576011448247 implements MigrationInterface {
  name = 'SetupSchools1576011448247';

  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      `CREATE TABLE "school" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "name" character varying NOT NULL,
        "domain" character varying NOT NULL,
        CONSTRAINT "PK_57836c3fe2f2c7734b20911755e" PRIMARY KEY ("id")
      )`,
    );
    // make user.school_id optional at first
    await queryRunner.query('ALTER TABLE "user" ADD "school_id" uuid');
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_ed1bcfe9ae995a567b529f316a2" FOREIGN KEY ("school_id") REFERENCES "school"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // insert dordt
    const results: {
      id: string;
    }[] = await queryRunner.query(
      'INSERT INTO "school"("name", "domain") VALUES ($1, $2) RETURNING "id"',
      ['Dordt University', 'dordt.edu'],
    );

    // all current users default to dordt
    const id = results[0].id;
    await queryRunner.query('UPDATE "user" SET "school_id" = $1', [id]);

    // make user.school_id required
    await queryRunner.query(
      'ALTER TABLE "user" ALTER COLUMN "school_id" SET NOT NULL',
    );
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(
      'ALTER TABLE "user" DROP CONSTRAINT "FK_ed1bcfe9ae995a567b529f316a2"',
    );
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "school_id"');
    await queryRunner.query('DROP TABLE "school"');
  }
}
