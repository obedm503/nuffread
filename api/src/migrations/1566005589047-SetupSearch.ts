import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetupSearch1566005589047 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS unaccent;
      CREATE EXTENSION IF NOT EXISTS pg_trgm;

      -- books
      ALTER TABLE "book" ADD "search_text" text NOT NULL DEFAULT '';
      UPDATE book SET search_text =
        unaccent(coalesce(isbn, '')) ||
        unaccent(coalesce(title, '')) ||
        unaccent(coalesce(sub_title, '')) ||
        unaccent(coalesce(authors, ''));

      CREATE INDEX book_search_text_idx
        ON book
        USING GIN(search_text gin_trgm_ops);

      CREATE OR REPLACE FUNCTION book_search_text_function() RETURNS trigger AS $$
        begin
          new.search_text :=
            unaccent(coalesce(isbn, '')) ||
            unaccent(coalesce(title, '')) ||
            unaccent(coalesce(sub_title, '')) ||
            unaccent(coalesce(authors, ''));
          return new;
        end
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER book_search_text_update BEFORE INSERT OR UPDATE
        ON book FOR EACH ROW EXECUTE PROCEDURE book_search_text_function();

      -- listings
      ALTER TABLE "listing" ADD "search_text" text NOT NULL DEFAULT '';
      UPDATE listing SET search_text = unaccent(coalesce(description, ''));

      CREATE INDEX listing_search_text_idx
        ON listing
        USING GIN(search_text gin_trgm_ops);

      CREATE OR REPLACE FUNCTION listing_search_text_function() RETURNS trigger AS $$
        begin
          new.search_text := unaccent(coalesce(description, ''));
          return new;
        end
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER listing_search_text_update BEFORE INSERT OR UPDATE
        ON listing FOR EACH ROW EXECUTE PROCEDURE listing_search_text_function();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS listing_search_text_update ON listing;
      DROP FUNCTION IF EXISTS listing_search_text_function();
      DROP INDEX IF EXISTS book_search_text_idx;
      ALTER TABLE book DROP COLUMN IF EXISTS search_text;

      DROP TRIGGER IF EXISTS book_search_text_update ON book;
      DROP FUNCTION IF EXISTS book_search_text_function();
      DROP INDEX IF EXISTS listing_search_text_idx;
      ALTER TABLE listing DROP COLUMN IF EXISTS search_text;
    `);
  }
}
