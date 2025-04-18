-- -------------------------------------------------------------
-- TablePlus 6.4.4(604)
--
-- https://tableplus.com/
--
-- Database: cjm_db
-- Generation Time: 2025-04-11 23:14:39.0150
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."Admins";
-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."Admins" (
    "id" uuid NOT NULL,
    "name" varchar(255) NOT NULL,
    "email" varchar(255) NOT NULL,
    "password" varchar(255) NOT NULL,
    "createdAt" timestamptz NOT NULL,
    "updatedAt" timestamptz NOT NULL,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."GoldPrices";
-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."GoldPrices" (
    "id" uuid NOT NULL,
    "date" date NOT NULL,
    "pricePerGram" numeric(10,2) NOT NULL,
    "is_deleted" bool NOT NULL DEFAULT false,
    "createdAt" timestamptz NOT NULL,
    "updatedAt" timestamptz NOT NULL,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."RedemptionRequests";
-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

DROP TYPE IF EXISTS "public"."enum_RedemptionRequests_type";
CREATE TYPE "public"."enum_RedemptionRequests_type" AS ENUM ('BONUS', 'MATURITY');
DROP TYPE IF EXISTS "public"."enum_RedemptionRequests_status";
CREATE TYPE "public"."enum_RedemptionRequests_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Table Definition
CREATE TABLE "public"."RedemptionRequests" (
    "id" uuid NOT NULL,
    "userSchemeId" uuid NOT NULL,
    "type" "public"."enum_RedemptionRequests_type" NOT NULL,
    "points" int4,
    "status" "public"."enum_RedemptionRequests_status" NOT NULL DEFAULT 'PENDING'::"enum_RedemptionRequests_status",
    "approvedBy" uuid,
    "approvedAt" timestamptz,
    "remarks" text,
    "is_deleted" bool NOT NULL DEFAULT false,
    "createdAt" timestamptz NOT NULL,
    "updatedAt" timestamptz NOT NULL,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."Schemes";
-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."Schemes" (
    "id" uuid NOT NULL,
    "name" varchar(255) NOT NULL,
    "duration" int4 NOT NULL,
    "goldGrams" numeric(10,3) NOT NULL,
    "createdAt" timestamptz NOT NULL,
    "updatedAt" timestamptz NOT NULL,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."SequelizeMeta";
-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."SequelizeMeta" (
    "name" varchar(255) NOT NULL,
    PRIMARY KEY ("name")
);

DROP TABLE IF EXISTS "public"."Settings";
-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."Settings" (
    "id" uuid NOT NULL,
    "is_deleted" bool NOT NULL DEFAULT false,
    "createdAt" timestamptz NOT NULL,
    "updatedAt" timestamptz NOT NULL,
    "key" varchar(255) NOT NULL,
    "value" varchar(255) NOT NULL,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."Transactions";
-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

DROP TYPE IF EXISTS "public"."enum_Transactions_transactionType";
CREATE TYPE "public"."enum_Transactions_transactionType" AS ENUM ('deposit', 'withdrawal', 'points', 'bonus_withdrawal');

-- Table Definition
CREATE TABLE "public"."Transactions" (
    "id" uuid NOT NULL,
    "userSchemeId" uuid NOT NULL,
    "transactionType" "public"."enum_Transactions_transactionType" NOT NULL,
    "amount" numeric(10,2) NOT NULL DEFAULT 0,
    "goldGrams" numeric(10,3) NOT NULL DEFAULT 0,
    "points" int4 NOT NULL DEFAULT 0,
    "priceRefId" uuid,
    "is_deleted" bool NOT NULL DEFAULT false,
    "createdAt" timestamptz NOT NULL,
    "updatedAt" timestamptz NOT NULL,
    "redeemReqId" uuid,
    "description" varchar(255),
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."Users";
-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."Users" (
    "id" uuid NOT NULL,
    "name" varchar(255) NOT NULL,
    "address" text NOT NULL,
    "email" varchar(255) NOT NULL,
    "password" varchar(255) NOT NULL,
    "nominee" varchar(255) NOT NULL,
    "relation" varchar(255) NOT NULL,
    "mobile" varchar(255) NOT NULL,
    "dob" date NOT NULL,
    "agreeTerms" bool DEFAULT false,
    "createdAt" timestamptz NOT NULL,
    "updatedAt" timestamptz NOT NULL,
    "is_active" bool NOT NULL DEFAULT true,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."UserSchemes";
-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

DROP TYPE IF EXISTS "public"."enum_UserSchemes_status";
CREATE TYPE "public"."enum_UserSchemes_status" AS ENUM ('ACTIVE', 'COMPLETED', 'WITHDRAWN');

-- Table Definition
CREATE TABLE "public"."UserSchemes" (
    "id" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "schemeId" uuid NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL,
    "totalPoints" int4 NOT NULL DEFAULT 0,
    "status" "public"."enum_UserSchemes_status" NOT NULL DEFAULT 'ACTIVE'::"enum_UserSchemes_status",
    "createdAt" timestamptz NOT NULL,
    "updatedAt" timestamptz NOT NULL,
    "availablePoints" int4 NOT NULL DEFAULT 0,
    PRIMARY KEY ("id")
);

-- Create Files table to track uploads
CREATE TABLE "public"."Files" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "originalName" varchar(255) NOT NULL,
    "filename" varchar(255) NOT NULL,
    "mimeType" varchar(100) NOT NULL,
    "size" integer NOT NULL,
    "path" varchar(255) NOT NULL,
    "url" varchar(500) NOT NULL,
    "userId" uuid NULL,
    "purpose" varchar(50) NOT NULL,
    "is_deleted" boolean NOT NULL DEFAULT false,
    "createdAt" timestamptz NOT NULL,
    "updatedAt" timestamptz NOT NULL,
    PRIMARY KEY ("id")
);

-- Add foreign key to Users table
ALTER TABLE "public"."Files" 
    ADD CONSTRAINT "fk_files_user" 
    FOREIGN KEY ("userId") 
    REFERENCES "public"."Users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- Add index for faster lookups by userId and purpose
CREATE INDEX "idx_files_user_purpose" ON "public"."Files"("userId", "purpose");


-- Indices
CREATE UNIQUE INDEX "Admins_email_key" ON public."Admins" USING btree (email);


-- Indices
CREATE UNIQUE INDEX unique_active_gold_price_per_date ON public."GoldPrices" USING btree (date) WHERE (is_deleted = false);
ALTER TABLE "public"."RedemptionRequests" ADD FOREIGN KEY ("userSchemeId") REFERENCES "public"."UserSchemes"("id");
ALTER TABLE "public"."RedemptionRequests" ADD FOREIGN KEY ("approvedBy") REFERENCES "public"."Admins"("id");


-- Indices
CREATE INDEX redemption_requests_user_scheme_id_status ON public."RedemptionRequests" USING btree ("userSchemeId", status);
CREATE INDEX redemption_requests_type_status ON public."RedemptionRequests" USING btree (type, status);


-- Indices
CREATE UNIQUE INDEX "Schemes_name_key" ON public."Schemes" USING btree (name);


-- Indices
CREATE UNIQUE INDEX "Settings_key_key" ON public."Settings" USING btree (key);
ALTER TABLE "public"."Transactions" ADD FOREIGN KEY ("userSchemeId") REFERENCES "public"."UserSchemes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."Transactions" ADD FOREIGN KEY ("priceRefId") REFERENCES "public"."GoldPrices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."Transactions" ADD FOREIGN KEY ("redeemReqId") REFERENCES "public"."RedemptionRequests"("id");


-- Indices
CREATE INDEX transactions_redeem_req_id ON public."Transactions" USING btree ("redeemReqId");


-- Indices
CREATE UNIQUE INDEX "Users_email_key" ON public."Users" USING btree (email);
ALTER TABLE "public"."UserSchemes" ADD FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."UserSchemes" ADD FOREIGN KEY ("schemeId") REFERENCES "public"."Schemes"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Indices
CREATE INDEX user_scheme_status_idx ON public."UserSchemes" USING btree ("userId", "schemeId", status);
