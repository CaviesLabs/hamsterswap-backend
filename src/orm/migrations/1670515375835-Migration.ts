import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1670515375835 implements MigrationInterface {
  name = 'Migration1670515375835';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "token_metadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "mintAddress" character varying NOT NULL, "metadata" json, "isNft" boolean NOT NULL, CONSTRAINT "PK_69858f47995fd449579fa325054" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_proposal" ALTER COLUMN "numberId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_session" ALTER COLUMN "grantType" SET DEFAULT 'GRANT_TYPE::ACCOUNT'`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_session" ALTER COLUMN "sessionType" SET DEFAULT 'SESSION_TYPE::DIRECT'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth_session" ALTER COLUMN "sessionType" SET DEFAULT 'SESSION_TYPE'`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_session" ALTER COLUMN "grantType" SET DEFAULT 'GRANT_TYPE'`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_proposal" ALTER COLUMN "numberId" SET NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "token_metadata"`);
  }
}
