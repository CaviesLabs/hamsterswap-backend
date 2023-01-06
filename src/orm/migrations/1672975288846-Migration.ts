import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1672975288846 implements MigrationInterface {
  name = 'Migration1672975288846';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "swap_proposal" ADD "chain" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "token_metadata" ADD "chain" character varying`,
    );
    await queryRunner.query(`UPDATE "token_metadata" SET chain = 'solana'`);
    await queryRunner.query(`UPDATE "swap_proposal" SET chain = 'solana'`);
    await queryRunner.query(
      `ALTER TABLE "swap_proposal" ALTER COLUMN "chain" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "token_metadata" ALTER COLUMN "chain" SET NOT NULL`,
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
    await queryRunner.query(`ALTER TABLE "token_metadata" DROP COLUMN "chain"`);
    await queryRunner.query(`ALTER TABLE "swap_proposal" DROP COLUMN "chain"`);
  }
}
