import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetupFullTextSearch1553004884987 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
set document_with_weights = 
  setweight(to_tsvector(isbn), 'A') ||
  setweight(to_tsvector(title), 'B') ||
  setweight(to_tsvector(coalesce(sub_title, '')), 'C') ||
  setweight(to_tsvector(authors), 'D');

CREATE INDEX document_weights_idx
  ON card
  USING GIN (document_with_weights);
        CREATE FUNCTION card_tsvector_trigger() RETURNS trigger AS $$
begin
  new.document_with_weights :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.artist, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.text, '')), 'C');
  return new;
end
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
    ON card FOR EACH ROW EXECUTE PROCEDURE card_tsvector_trigger();
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
      DROP INDEX document_with_weights;
    `);
  }
}
