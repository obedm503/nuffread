import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChat1592002152110 implements MigrationInterface {
  name = 'AddChat1592002152110';

  async up(queryRunner: QueryRunner) {
    await queryRunner.query(`
      CREATE TABLE "thread" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "seller_id" uuid NOT NULL,
        "buyer_id" uuid NOT NULL,
        "listing_id" uuid NOT NULL,
        "last_message_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_cabc0f3f27d7b1c70cf64623e02" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_20db85b0775c56734c7a4aeb5f" ON "thread"
      USING BTREE ("seller_id", "buyer_id", "listing_id")
    `);
    await queryRunner.query(`
      CREATE TABLE "message" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "thread_id" uuid NOT NULL,
        "from_id" uuid NOT NULL,
        "to_id" uuid NOT NULL,
        "content" text NOT NULL,
        CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "thread"
      ADD CONSTRAINT "FK_b14d27efc98363ebe2373d0d086"
      FOREIGN KEY ("seller_id") REFERENCES "user"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "thread"
      ADD CONSTRAINT "FK_72f73ea24dbc51e7755639c9e24"
      FOREIGN KEY ("buyer_id") REFERENCES "user"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "thread"
      ADD CONSTRAINT "FK_be23fe09f927a14e5907eda093d"
      FOREIGN KEY ("listing_id") REFERENCES "listing"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "message"
      ADD CONSTRAINT "FK_11cb07b9ecf8cb247c5e2dc86ab"
      FOREIGN KEY ("thread_id") REFERENCES "thread"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "message"
      ADD CONSTRAINT "FK_47f1ad2240dd9ecfbbcf478d77f"
      FOREIGN KEY ("from_id") REFERENCES "user"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "message"
      ADD CONSTRAINT "FK_9744da731491ef8ca64646a8540"
      FOREIGN KEY ("to_id") REFERENCES "user"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(`
      ALTER TABLE "message" DROP CONSTRAINT "FK_9744da731491ef8ca64646a8540"
    `);
    await queryRunner.query(`
      ALTER TABLE "message" DROP CONSTRAINT "FK_47f1ad2240dd9ecfbbcf478d77f"
    `);
    await queryRunner.query(`
      ALTER TABLE "message" DROP CONSTRAINT "FK_11cb07b9ecf8cb247c5e2dc86ab"
    `);
    await queryRunner.query(`
      ALTER TABLE "thread" DROP CONSTRAINT "FK_be23fe09f927a14e5907eda093d"
    `);
    await queryRunner.query(`
      ALTER TABLE "thread" DROP CONSTRAINT "FK_72f73ea24dbc51e7755639c9e24"
    `);
    await queryRunner.query(`
      ALTER TABLE "thread" DROP CONSTRAINT "FK_b14d27efc98363ebe2373d0d086"
    `);
    await queryRunner.query(`DROP TABLE "message"`);
    await queryRunner.query(`DROP INDEX "IDX_20db85b0775c56734c7a4aeb5f"`);
    await queryRunner.query(`DROP TABLE "thread"`);
  }
}
