import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable(
  "users",
  {
    userId: uuid("user_id").primaryKey(),
    loginName: varchar("login_name", { length: 30 }).notNull(),
    displayName: varchar("display_name", { length: 100 }),
    passwordHash: varchar("password_hash", { length: 350 }).notNull(),
    passwordSalt: varchar("password_salt", { length: 30 }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  },
  (table) => [unique("users_login_name_unique").on(table.loginName)],
);

export const userRefreshTokensTable = pgTable("user_refresh_tokens", {
  tokenId: uuid("token_id").primaryKey(),
  ownerId: uuid("owner_id").notNull(),
  exp: timestamp("token_exp", { mode: "date" }).notNull(),
});

export const worksTable = pgTable(
  "works",
  {
    workId: uuid("work_id").primaryKey(),
    ownerId: uuid("owner_id").notNull(),
    slug: varchar({ length: 150 }).notNull(),
    title: varchar({ length: 150 }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  },
  (table) => [
    unique("works_owner_id_slug_unique").on(
      table.ownerId,
      table.slug,
      table.deletedAt,
    ),
    unique("works_owner_id_title_unique").on(
      table.ownerId,
      table.title,
      table.deletedAt,
    ),
  ],
);

export const workFieldsTable = pgTable(
  "work_fields",
  {
    workFieldId: uuid("work_field_id").primaryKey(),
    parentId: uuid("parent_id").notNull(),
    displayOrder: integer("display_order").notNull(),
    fieldName: varchar("field_name", { length: 100 }).notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
    fieldType: integer("field_type").notNull(),
    fieldValue: text("field_value").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  },
  (table) => [
    unique("work_fields_parent_id_field_name_unique").on(
      table.parentId,
      table.fieldName,
      table.deletedAt,
    ),
  ],
);
