CREATE TABLE "revoked_tokens" (
	"rejection_id" serial PRIMARY KEY NOT NULL,
	"jwt_exp" timestamp NOT NULL,
	"jwt_jti" text NOT NULL
);
--> statement-breakpoint
DROP TABLE "user_refresh_tokens" CASCADE;