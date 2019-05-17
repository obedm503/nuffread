import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetupFullTextSearch1553004884987 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE "listing" ADD "document_with_weights" tsvector NOT NULL DEFAULT '';
UPDATE listing SET document_with_weights = 
  setweight(to_tsvector('english'::regconfig, unaccent(coalesce(isbn, ''))), 'A') ||
  setweight(to_tsvector('english'::regconfig, unaccent(coalesce(title, ''))), 'B') ||
  setweight(to_tsvector('english'::regconfig, unaccent(coalesce(sub_title, ''))), 'C') ||
  setweight(to_tsvector('english'::regconfig, unaccent(coalesce(authors, ''))), 'D');

CREATE INDEX document_weights_idx
  ON listing
  USING GIN (document_with_weights);

CREATE OR REPLACE FUNCTION listing_tsvector_function() RETURNS trigger AS $$
  begin
    new.document_with_weights :=
      setweight(to_tsvector('english'::regconfig, unaccent(coalesce(new.isbn, ''))), 'A') ||
      setweight(to_tsvector('english'::regconfig, unaccent(coalesce(new.title, ''))), 'B') ||
      setweight(to_tsvector('english'::regconfig, unaccent(coalesce(new.sub_title, ''))), 'C') ||
      setweight(to_tsvector('english'::regconfig, unaccent(coalesce(new.authors, ''))), 'D');
    return new;
  end
$$ LANGUAGE plpgsql;

CREATE TRIGGER listing_tsvector_update BEFORE INSERT OR UPDATE
  ON listing FOR EACH ROW EXECUTE PROCEDURE listing_tsvector_function();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS listing_tsvector_update ON listing;
      DROP FUNCTION IF EXISTS listing_tsvector_function();
      DROP INDEX IF EXISTS document_weights_idx;
      ALTER TABLE listing DROP COLUMN IF EXISTS document_with_weights;
      DROP EXTENSION IF EXISTS unaccent;
    `);
  }
}
