import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1692155203395 implements MigrationInterface {
  name = 'Migration1692155203395';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "swap_option" ADD "chainId" character varying NOT NULL DEFAULT 'solana'`,
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
    await queryRunner.query(`ALTER TABLE "swap_option" DROP COLUMN "chainId"`);
  }
}
