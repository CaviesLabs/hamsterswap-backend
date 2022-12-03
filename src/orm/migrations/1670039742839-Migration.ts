import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1670039742839 implements MigrationInterface {
  name = 'Migration1670039742839';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "telegram" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "twitter" character varying`,
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
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitter"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "telegram"`);
  }
}
