import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1669828371560 implements MigrationInterface {
  name = 'Migration1669828371560';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "email" character varying, "emailVerified" boolean, "birthday" TIMESTAMP, "displayName" character varying, "avatar" character varying, "roles" character varying array NOT NULL, "groups" character varying array, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "enabled_idp" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "identityId" character varying NOT NULL, "type" character varying NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_ad7694acd5567493bca6da79f62" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "identityId_uidx" ON "enabled_idp" ("identityId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "userId_idx" ON "enabled_idp" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "userId_id_idx" ON "enabled_idp" ("userId", "id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "userId_type_idx" ON "enabled_idp" ("userId", "type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "userId_identityId_idx" ON "enabled_idp" ("userId", "identityId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "extended_session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" character varying NOT NULL, "userIpAddress" character varying array NOT NULL DEFAULT '{}', "userAgent" character varying array NOT NULL DEFAULT '{}', "lastActiveTime" TIMESTAMP WITH TIME ZONE NOT NULL, "distributionType" character varying NOT NULL, "sessionOrigin" character varying NOT NULL, "enabledIdpId" uuid NOT NULL, CONSTRAINT "PK_221a9c21d28163d5485a2f64847" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "actorId" character varying NOT NULL, "authorizedPartyId" character varying NOT NULL, "checksum" character varying NOT NULL, "grantType" character varying NOT NULL DEFAULT 'GRANT_TYPE::ACCOUNT', "sessionType" character varying NOT NULL DEFAULT 'SESSION_TYPE::DIRECT', "expiryDate" TIMESTAMP WITH TIME ZONE NOT NULL, "scopes" character varying array NOT NULL, CONSTRAINT "PK_19354ed146424a728c1112a8cbf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "actorId_idx" ON "auth_session" ("actorId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "authorizedPartyId_idx" ON "auth_session" ("authorizedPartyId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "checksum_uidx" ON "auth_session" ("checksum") `,
    );
    await queryRunner.query(
      `CREATE TABLE "swap_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "ownerAddress" character varying, "type" character varying NOT NULL, "contractAddress" character varying NOT NULL, "depositedAddress" character varying, "amount" character varying NOT NULL, "status" character varying NOT NULL, "nftMetadata" jsonb, CONSTRAINT "PK_f7bc96c1cc998d3e5336b079d0e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "swap_option" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_b8efcce39e51623156497fca32f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "swap_proposal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "ownerId" uuid NOT NULL, "ownerAddress" character varying NOT NULL, "fulfillBy" character varying, "fulfilledWithOptionId" uuid, "expireAt" TIMESTAMP WITH TIME ZONE NOT NULL, "status" character varying NOT NULL, "note" character varying NOT NULL DEFAULT '', "searchText" character varying NOT NULL DEFAULT '', CONSTRAINT "PK_365df198e98b71d4f2cf48b300b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d91082441eb45edb7f8e4e7637" ON "swap_proposal" ("searchText") `,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_challenge" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "target" character varying NOT NULL, "memo" character varying NOT NULL, "expiryDate" TIMESTAMP WITH TIME ZONE NOT NULL, "isResolved" boolean NOT NULL, "durationDelta" integer NOT NULL, CONSTRAINT "PK_afd9a8cbeb610e138f30e769eb4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "target_createdAt_idx" ON "auth_challenge" ("target", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "swap_option_items_swap_item" ("swapOptionId" uuid NOT NULL, "swapItemId" uuid NOT NULL, CONSTRAINT "PK_12a8a267d89b2210e818b5ae1db" PRIMARY KEY ("swapOptionId", "swapItemId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2033c2577306d764ab1d514c21" ON "swap_option_items_swap_item" ("swapOptionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_06d1f9d9cf4a027404af63a078" ON "swap_option_items_swap_item" ("swapItemId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "swap_proposal_offer_items_swap_item" ("swapProposalId" uuid NOT NULL, "swapItemId" uuid NOT NULL, CONSTRAINT "PK_616c0de3bffd6e9daa130b3421c" PRIMARY KEY ("swapProposalId", "swapItemId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_efe28106f3d9ae0371b18f591d" ON "swap_proposal_offer_items_swap_item" ("swapProposalId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ba5cc38561910c97cdc10206d5" ON "swap_proposal_offer_items_swap_item" ("swapItemId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "swap_proposal_swap_options_swap_option" ("swapProposalId" uuid NOT NULL, "swapOptionId" uuid NOT NULL, CONSTRAINT "PK_ad81d08bf07e0a25cf14b22edbb" PRIMARY KEY ("swapProposalId", "swapOptionId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f6d8ca018ce51a9abb40c01aa8" ON "swap_proposal_swap_options_swap_option" ("swapProposalId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_06bf4ac6f9f07405cc53154a10" ON "swap_proposal_swap_options_swap_option" ("swapOptionId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "enabled_idp" ADD CONSTRAINT "FK_82cb86f7fc2b83067ab874dd39d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "extended_session" ADD CONSTRAINT "FK_c29771521b673074ff49c1e0d84" FOREIGN KEY ("enabledIdpId") REFERENCES "enabled_idp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_proposal" ADD CONSTRAINT "FK_1bfffd8a2e68e60fcd4296a3286" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_proposal" ADD CONSTRAINT "FK_c539c12ccbc54da19a1e3b6fe07" FOREIGN KEY ("fulfilledWithOptionId") REFERENCES "swap_option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_option_items_swap_item" ADD CONSTRAINT "FK_2033c2577306d764ab1d514c215" FOREIGN KEY ("swapOptionId") REFERENCES "swap_option"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_option_items_swap_item" ADD CONSTRAINT "FK_06d1f9d9cf4a027404af63a0786" FOREIGN KEY ("swapItemId") REFERENCES "swap_item"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_proposal_offer_items_swap_item" ADD CONSTRAINT "FK_efe28106f3d9ae0371b18f591d4" FOREIGN KEY ("swapProposalId") REFERENCES "swap_proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_proposal_offer_items_swap_item" ADD CONSTRAINT "FK_ba5cc38561910c97cdc10206d50" FOREIGN KEY ("swapItemId") REFERENCES "swap_item"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_proposal_swap_options_swap_option" ADD CONSTRAINT "FK_f6d8ca018ce51a9abb40c01aa80" FOREIGN KEY ("swapProposalId") REFERENCES "swap_proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_proposal_swap_options_swap_option" ADD CONSTRAINT "FK_06bf4ac6f9f07405cc53154a108" FOREIGN KEY ("swapOptionId") REFERENCES "swap_option"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "swap_proposal_swap_options_swap_option" DROP CONSTRAINT "FK_06bf4ac6f9f07405cc53154a108"`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_proposal_swap_options_swap_option" DROP CONSTRAINT "FK_f6d8ca018ce51a9abb40c01aa80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_proposal_offer_items_swap_item" DROP CONSTRAINT "FK_ba5cc38561910c97cdc10206d50"`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_proposal_offer_items_swap_item" DROP CONSTRAINT "FK_efe28106f3d9ae0371b18f591d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_option_items_swap_item" DROP CONSTRAINT "FK_06d1f9d9cf4a027404af63a0786"`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_option_items_swap_item" DROP CONSTRAINT "FK_2033c2577306d764ab1d514c215"`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_proposal" DROP CONSTRAINT "FK_c539c12ccbc54da19a1e3b6fe07"`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_proposal" DROP CONSTRAINT "FK_1bfffd8a2e68e60fcd4296a3286"`,
    );
    await queryRunner.query(
      `ALTER TABLE "extended_session" DROP CONSTRAINT "FK_c29771521b673074ff49c1e0d84"`,
    );
    await queryRunner.query(
      `ALTER TABLE "enabled_idp" DROP CONSTRAINT "FK_82cb86f7fc2b83067ab874dd39d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_06bf4ac6f9f07405cc53154a10"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f6d8ca018ce51a9abb40c01aa8"`,
    );
    await queryRunner.query(
      `DROP TABLE "swap_proposal_swap_options_swap_option"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ba5cc38561910c97cdc10206d5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_efe28106f3d9ae0371b18f591d"`,
    );
    await queryRunner.query(`DROP TABLE "swap_proposal_offer_items_swap_item"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_06d1f9d9cf4a027404af63a078"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2033c2577306d764ab1d514c21"`,
    );
    await queryRunner.query(`DROP TABLE "swap_option_items_swap_item"`);
    await queryRunner.query(`DROP INDEX "public"."target_createdAt_idx"`);
    await queryRunner.query(`DROP TABLE "auth_challenge"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d91082441eb45edb7f8e4e7637"`,
    );
    await queryRunner.query(`DROP TABLE "swap_proposal"`);
    await queryRunner.query(`DROP TABLE "swap_option"`);
    await queryRunner.query(`DROP TABLE "swap_item"`);
    await queryRunner.query(`DROP INDEX "public"."checksum_uidx"`);
    await queryRunner.query(`DROP INDEX "public"."authorizedPartyId_idx"`);
    await queryRunner.query(`DROP INDEX "public"."actorId_idx"`);
    await queryRunner.query(`DROP TABLE "auth_session"`);
    await queryRunner.query(`DROP TABLE "extended_session"`);
    await queryRunner.query(`DROP INDEX "public"."userId_identityId_idx"`);
    await queryRunner.query(`DROP INDEX "public"."userId_type_idx"`);
    await queryRunner.query(`DROP INDEX "public"."userId_id_idx"`);
    await queryRunner.query(`DROP INDEX "public"."userId_idx"`);
    await queryRunner.query(`DROP INDEX "public"."identityId_uidx"`);
    await queryRunner.query(`DROP TABLE "enabled_idp"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
