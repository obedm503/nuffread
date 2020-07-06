import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecentHistory1574314509729 implements MigrationInterface {
  name = 'RecentHistory1574314509729';

  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      `CREATE TABLE "recent_listing" (
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL,
        "listing_id" uuid NOT NULL,
        CONSTRAINT "PK_7806681fcf7d8f763dc0c604f23" PRIMARY KEY (
          "user_id",
          "listing_id"
        )
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "recent_listing"
      ADD CONSTRAINT "FK_8988ae0a0f2cc56563de2b76957"
      FOREIGN KEY ("user_id") REFERENCES "user"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recent_listing"
      ADD CONSTRAINT "FK_03093eacafffeb44a018ccbefa7"
      FOREIGN KEY ("listing_id") REFERENCES "listing"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(
      `ALTER TABLE "recent_listing" DROP CONSTRAINT "FK_03093eacafffeb44a018ccbefa7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recent_listing" DROP CONSTRAINT "FK_8988ae0a0f2cc56563de2b76957"`,
    );
    await queryRunner.query(`DROP TABLE "recent_listing"`);
  }
}
