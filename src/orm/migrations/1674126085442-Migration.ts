import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1674126085442 implements MigrationInterface {
  name = 'Migration1674126085442';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth_session" ALTER COLUMN "grantType" SET DEFAULT 'GRANT_TYPE::ACCOUNT'`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_session" ALTER COLUMN "sessionType" SET DEFAULT 'SESSION_TYPE::DIRECT'`,
    );
    await queryRunner.query(
      `ALTER TABLE "token_metadata" ADD CONSTRAINT "UQ_630010c65cb8dea7a9cbbd017cf" UNIQUE ("mintAddress")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "token_metadata" DROP CONSTRAINT "UQ_630010c65cb8dea7a9cbbd017cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_session" ALTER COLUMN "sessionType" SET DEFAULT 'SESSION_TYPE'`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_session" ALTER COLUMN "grantType" SET DEFAULT 'GRANT_TYPE'`,
    );
  }
}
