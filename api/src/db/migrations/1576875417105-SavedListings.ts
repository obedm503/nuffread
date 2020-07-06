import { MigrationInterface, QueryRunner } from 'typeorm';

export class SavedListings1576875417105 implements MigrationInterface {
  name = 'SavedListings1576875417105';

  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      `CREATE TABLE "saved_listing" (
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL,
        "listing_id" uuid NOT NULL,
        CONSTRAINT "PK_c9503ed1f3d950079419f658f63" PRIMARY KEY (
          "user_id",
          "listing_id"
        )
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_listing"
      ADD CONSTRAINT "FK_aa40bdb8f35317d90d599ffacdc"
      FOREIGN KEY ("user_id") REFERENCES "user"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_listing"
      ADD CONSTRAINT "FK_da979b16122082a163f89139238"
      FOREIGN KEY ("listing_id") REFERENCES "listing"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(
      `ALTER TABLE "saved_listing" DROP CONSTRAINT "FK_da979b16122082a163f89139238"`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_listing" DROP CONSTRAINT "FK_aa40bdb8f35317d90d599ffacdc"`,
    );
    await queryRunner.query(`DROP TABLE "saved_listing"`);
  }
}
