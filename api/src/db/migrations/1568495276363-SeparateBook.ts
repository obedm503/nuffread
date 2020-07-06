import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeparateBook1568495276363 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      `CREATE TABLE "book" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "google_id" character varying,"etag" character varying,
        "isbn" text NOT NULL,
        "thumbnail" character varying,
        "title" character varying NOT NULL,
        "sub_title" character varying,
        "authors" text NOT NULL,
        "published_at" TIMESTAMP,
        CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "google_id"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "etag"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "isbn"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "thumbnail"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "sub_title"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "authors"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "published_at"`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "book_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "description" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "is_public" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD CONSTRAINT "FK_e08e7ec5217e8e4651b7b80ab68" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD CONSTRAINT "FK_1d0a76cdbe48c877ddb9f8c648d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP CONSTRAINT "FK_1d0a76cdbe48c877ddb9f8c648d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP CONSTRAINT "FK_e08e7ec5217e8e4651b7b80ab68"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "is_public"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "book_id"`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "published_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "authors" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "sub_title" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "title" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "thumbnail" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "listing" ADD "isbn" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "etag" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "google_id" character varying NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "book"`);
  }
}
