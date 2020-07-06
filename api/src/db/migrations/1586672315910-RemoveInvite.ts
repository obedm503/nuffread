import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveInvite1586672315910 implements MigrationInterface {
  name = 'RemoveInvite1586672315910';

  async up(queryRunner: QueryRunner) {
    // going forward invite.code moves to user.confirm_code
    await queryRunner.query(
      `ALTER TABLE "user" ADD "confirm_code" character varying`,
    );
    await queryRunner.query(`
      UPDATE "user"
      SET "confirm_code" = "code"
      FROM "invite"
      WHERE "user"."email" = "invite"."email" AND "confirmed_at" IS NULL
    `);

    // fk reference to user.email <-> invite.email
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_e12875dfb3b1d92d7d7c5377e22"`,
    );
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT "UQ_76806ddab5d6110f898cdb7e3f2" UNIQUE ("confirm_code")
    `);
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "confirm_code"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_76806ddab5d6110f898cdb7e3f2"`,
    );
    // no need to re-add the constraint. there will be more users than invites
    // await queryRunner.query(`
    //   ALTER TABLE "user"
    //   ADD CONSTRAINT "FK_e12875dfb3b1d92d7d7c5377e22"
    //   FOREIGN KEY ("email") REFERENCES "invite"("email")
    //   ON DELETE NO ACTION ON UPDATE NO ACTION
    // `);
  }
}
