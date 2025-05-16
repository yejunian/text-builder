CREATE TABLE "user_refresh_tokens" (
	"token_id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"jwt_exp" timestamp NOT NULL,
	"jwt_jti" text NOT NULL
);
--> statement-breakpoint
DROP TABLE "revoked_tokens" CASCADE;