import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1669361810447 implements MigrationInterface {
  name = 'Migration1669361810447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "extended_session" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" character varying NOT NULL, "userIpAddress" character varying array NOT NULL, "userAgent" character varying array NOT NULL, "lastActiveTime" TIMESTAMP NOT NULL, "distributionType" character varying NOT NULL, "sessionOrigin" character varying NOT NULL, "enabledIdpId" character varying NOT NULL, CONSTRAINT "PK_221a9c21d28163d5485a2f64847" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "email" character varying NOT NULL, "emailVerified" boolean NOT NULL, "birthday" TIMESTAMP NOT NULL, "displayName" character varying NOT NULL, "avatar" character varying NOT NULL, "roles" character varying array NOT NULL, "groups" character varying array NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "enabled_idp" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "identityId" character varying NOT NULL, "type" character varying NOT NULL, "userId" character varying NOT NULL, CONSTRAINT "PK_ad7694acd5567493bca6da79f62" PRIMARY KEY ("id"))`,
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
      `CREATE TABLE "auth_session" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "actorId" character varying NOT NULL, "authorizedPartyId" character varying NOT NULL, "checksum" character varying NOT NULL, "grantType" character varying NOT NULL DEFAULT 'GRANT_TYPE::ACCOUNT', "sessionType" character varying NOT NULL DEFAULT 'SESSION_TYPE::DIRECT', "expiryDate" TIMESTAMP NOT NULL, "scopes" character varying array NOT NULL, CONSTRAINT "PK_19354ed146424a728c1112a8cbf" PRIMARY KEY ("id"))`,
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
      `CREATE TABLE "swap_platform_config" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "maxAllowedOptions" integer NOT NULL, "maxAllowedItems" integer NOT NULL, "allowNTFCollections" character varying array NOT NULL, "allowCurrencies" character varying array NOT NULL, CONSTRAINT "PK_4aa32fc19bf4909a1fca227b90c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_challenge" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "target" character varying NOT NULL, "memo" character varying NOT NULL, "expiryDate" TIMESTAMP NOT NULL, "isResolved" boolean NOT NULL, "durationDelta" integer NOT NULL, CONSTRAINT "PK_afd9a8cbeb610e138f30e769eb4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "target_createdAt_idx" ON "auth_challenge" ("target", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "swap_item" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "ownerAddress" character varying NOT NULL, "type" character varying NOT NULL, "contractAddress" character varying NOT NULL, "depositedAddress" character varying NOT NULL, "amount" character varying NOT NULL, "status" character varying NOT NULL, "nftMetadata" jsonb NOT NULL, CONSTRAINT "PK_f7bc96c1cc998d3e5336b079d0e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "swap_option" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_b8efcce39e51623156497fca32f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "swap_proposal_additional_data" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "note" character varying NOT NULL, CONSTRAINT "PK_efd757a4d8c8136feeb1cf5be8f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "swap_proposal" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "ownerAddress" character varying NOT NULL, "fulfillBy" character varying NOT NULL, "expireAt" TIMESTAMP NOT NULL, "status" character varying NOT NULL, "additionalDataId" character varying, CONSTRAINT "REL_4b54a4f8ecee82a3d0a704279b" UNIQUE ("additionalDataId"), CONSTRAINT "PK_365df198e98b71d4f2cf48b300b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "swap_option_items_swap_item" ("swapOptionId" character varying NOT NULL, "swapItemId" character varying NOT NULL, CONSTRAINT "PK_12a8a267d89b2210e818b5ae1db" PRIMARY KEY ("swapOptionId", "swapItemId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2033c2577306d764ab1d514c21" ON "swap_option_items_swap_item" ("swapOptionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_06d1f9d9cf4a027404af63a078" ON "swap_option_items_swap_item" ("swapItemId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "swap_proposal_offer_items_swap_item" ("swapProposalId" character varying NOT NULL, "swapItemId" character varying NOT NULL, CONSTRAINT "PK_616c0de3bffd6e9daa130b3421c" PRIMARY KEY ("swapProposalId", "swapItemId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_efe28106f3d9ae0371b18f591d" ON "swap_proposal_offer_items_swap_item" ("swapProposalId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ba5cc38561910c97cdc10206d5" ON "swap_proposal_offer_items_swap_item" ("swapItemId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "swap_proposal_swap_options_swap_option" ("swapProposalId" character varying NOT NULL, "swapOptionId" character varying NOT NULL, CONSTRAINT "PK_ad81d08bf07e0a25cf14b22edbb" PRIMARY KEY ("swapProposalId", "swapOptionId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f6d8ca018ce51a9abb40c01aa8" ON "swap_proposal_swap_options_swap_option" ("swapProposalId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_06bf4ac6f9f07405cc53154a10" ON "swap_proposal_swap_options_swap_option" ("swapOptionId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "extended_session" ADD CONSTRAINT "FK_c29771521b673074ff49c1e0d84" FOREIGN KEY ("enabledIdpId") REFERENCES "enabled_idp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "enabled_idp" ADD CONSTRAINT "FK_82cb86f7fc2b83067ab874dd39d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "swap_proposal" ADD CONSTRAINT "FK_4b54a4f8ecee82a3d0a704279bb" FOREIGN KEY ("additionalDataId") REFERENCES "swap_proposal_additional_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "swap_proposal" DROP CONSTRAINT "FK_4b54a4f8ecee82a3d0a704279bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "enabled_idp" DROP CONSTRAINT "FK_82cb86f7fc2b83067ab874dd39d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "extended_session" DROP CONSTRAINT "FK_c29771521b673074ff49c1e0d84"`,
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
    await queryRunner.query(`DROP TABLE "swap_proposal"`);
    await queryRunner.query(`DROP TABLE "swap_proposal_additional_data"`);
    await queryRunner.query(`DROP TABLE "swap_option"`);
    await queryRunner.query(`DROP TABLE "swap_item"`);
    await queryRunner.query(`DROP INDEX "public"."target_createdAt_idx"`);
    await queryRunner.query(`DROP TABLE "auth_challenge"`);
    await queryRunner.query(`DROP TABLE "swap_platform_config"`);
    await queryRunner.query(`DROP INDEX "public"."checksum_uidx"`);
    await queryRunner.query(`DROP INDEX "public"."authorizedPartyId_idx"`);
    await queryRunner.query(`DROP INDEX "public"."actorId_idx"`);
    await queryRunner.query(`DROP TABLE "auth_session"`);
    await queryRunner.query(`DROP INDEX "public"."userId_identityId_idx"`);
    await queryRunner.query(`DROP INDEX "public"."userId_type_idx"`);
    await queryRunner.query(`DROP INDEX "public"."userId_id_idx"`);
    await queryRunner.query(`DROP INDEX "public"."userId_idx"`);
    await queryRunner.query(`DROP INDEX "public"."identityId_uidx"`);
    await queryRunner.query(`DROP TABLE "enabled_idp"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "extended_session"`);
  }
}
