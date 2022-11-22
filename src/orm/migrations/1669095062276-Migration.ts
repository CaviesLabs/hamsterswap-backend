import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1669095062276 implements MigrationInterface {
  name = 'Migration1669095062276';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auth_session_model" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "actorId" character varying NOT NULL, "authorizedPartyId" character varying NOT NULL, "checksum" character varying NOT NULL, "grantType" character varying NOT NULL DEFAULT 'GRANT_TYPE::ACCOUNT', "sessionType" character varying NOT NULL DEFAULT 'SESSION_TYPE::DIRECT', "expiryDate" TIMESTAMP NOT NULL, "scopes" character varying array NOT NULL, CONSTRAINT "PK_b815164957fc721c2383fbcf900" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4cd695dfa8d7ab6f0f93b90366" ON "auth_session_model" ("actorId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_45639a160d5c6fc73da43947c0" ON "auth_session_model" ("authorizedPartyId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8cc3c622892c0881090082463a" ON "auth_session_model" ("checksum") `,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_challenge_model" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "target" character varying NOT NULL, "memo" character varying NOT NULL, "expiryDate" TIMESTAMP NOT NULL, "isResolved" boolean NOT NULL, "durationDelta" integer NOT NULL, CONSTRAINT "PK_7b7871a5a903b8a315efa70ad8b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7d71786bb3a28bc1d46e26acf5" ON "auth_challenge_model" ("target", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "enabled_idp_model" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "identityId" character varying NOT NULL, "type" character varying NOT NULL, "userId" character varying NOT NULL, CONSTRAINT "PK_d3b7939cdbd1500e0d82b8dfe75" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_71611f03ee252591cc4a771d08" ON "enabled_idp_model" ("identityId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6b7d67a13fd1bf8a8aa0f18354" ON "enabled_idp_model" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3e01c6f3c43645d602bf1dbb37" ON "enabled_idp_model" ("userId", "id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_32c6ddc98a5054955db4bddf28" ON "enabled_idp_model" ("userId", "type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0126e6fc55bd4a228df419d1cf" ON "enabled_idp_model" ("userId", "identityId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "extended_session_model" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" character varying NOT NULL, "userIpAddress" character varying array NOT NULL, "userAgent" character varying array NOT NULL, "lastActiveTime" TIMESTAMP NOT NULL, "distributionType" character varying NOT NULL, "sessionOrigin" character varying NOT NULL, "enabledIdpId" character varying NOT NULL, CONSTRAINT "PK_58308142dc4fdb5ac037744326e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "extended_session_model" ADD CONSTRAINT "FK_465289dea7ab863d0252fac1fd1" FOREIGN KEY ("enabledIdpId") REFERENCES "enabled_idp_model"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "extended_session_model" DROP CONSTRAINT "FK_465289dea7ab863d0252fac1fd1"`,
    );
    await queryRunner.query(`DROP TABLE "extended_session_model"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0126e6fc55bd4a228df419d1cf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_32c6ddc98a5054955db4bddf28"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3e01c6f3c43645d602bf1dbb37"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6b7d67a13fd1bf8a8aa0f18354"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_71611f03ee252591cc4a771d08"`,
    );
    await queryRunner.query(`DROP TABLE "enabled_idp_model"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7d71786bb3a28bc1d46e26acf5"`,
    );
    await queryRunner.query(`DROP TABLE "auth_challenge_model"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8cc3c622892c0881090082463a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_45639a160d5c6fc73da43947c0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4cd695dfa8d7ab6f0f93b90366"`,
    );
    await queryRunner.query(`DROP TABLE "auth_session_model"`);
  }
}
