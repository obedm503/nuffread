import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserInvite1568495037894 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      `CREATE TABLE "invite" (
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "email" character varying NOT NULL,
        "code" character varying NOT NULL,
        "name" character varying NOT NULL,
        "invited_at" TIMESTAMP,
        CONSTRAINT "UQ_ffbbc5bbb052814e22a0c525ff4" UNIQUE ("code"),
        CONSTRAINT "PK_658d8246180c0345d32a100544e" PRIMARY KEY ("email")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "confirmed_at" TIMESTAMP,
        "name" character varying,
        "photo" character varying,
        CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
        CONSTRAINT "REL_e12875dfb3b1d92d7d7c5377e2" UNIQUE ("email"),
        CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_e12875dfb3b1d92d7d7c5377e22" FOREIGN KEY ("email") REFERENCES "invite"("email") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_e12875dfb3b1d92d7d7c5377e22"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "invite"`);
  }
}
