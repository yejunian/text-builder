CREATE TABLE "user_refresh_tokens" (
	"token_id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"login_name" varchar(100) NOT NULL,
	"display_name" varchar(100),
	"password_hash" varchar(350) NOT NULL,
	"password_salt" varchar(30) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_login_name_unique" UNIQUE("login_name")
);
--> statement-breakpoint
CREATE TABLE "work_field_types" (
	"work_field_type_id" serial PRIMARY KEY NOT NULL,
	"type_name" varchar(100) NOT NULL,
	CONSTRAINT "work_field_types_type_name_unique" UNIQUE("type_name")
);
--> statement-breakpoint
CREATE TABLE "work_fields" (
	"work_field_id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer NOT NULL,
	"display_order" integer NOT NULL,
	"field_name" varchar(100) NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"field_type" integer NOT NULL,
	"field_value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "work_fields_parent_id_field_name_unique" UNIQUE("parent_id","field_name")
);
--> statement-breakpoint
CREATE TABLE "works" (
	"work_id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"slug" varchar(150) NOT NULL,
	"title" varchar(150) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "works_owner_id_slug_unique" UNIQUE("owner_id","slug"),
	CONSTRAINT "works_owner_id_title_unique" UNIQUE("owner_id","title")
);
