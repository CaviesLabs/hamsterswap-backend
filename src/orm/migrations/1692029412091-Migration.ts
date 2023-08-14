import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1692029412091 implements MigrationInterface {
  name = 'Migration1692029412091';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "swap_proposal" ADD "chainId" character varying NOT NULL DEFAULT 'solana'`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_item" ADD "chainId" character varying NOT NULL DEFAULT 'solana'`,
    );
    await queryRunner.query(
      `ALTER TABLE "token_metadata" ADD "chainId" character varying NOT NULL DEFAULT 'solana'`,
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
      `ALTER TABLE "token_metadata" DROP COLUMN "chainId"`,
    );
    await queryRunner.query(`ALTER TABLE "swap_item" DROP COLUMN "chainId"`);
    await queryRunner.query(
      `ALTER TABLE "swap_proposal" DROP COLUMN "chainId"`,
    );
  }
}
