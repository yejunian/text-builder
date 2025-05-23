import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable(
  "users",
  {
    userId: serial("user_id").primaryKey(),
    loginName: varchar("login_name", { length: 30 }).notNull(),
    displayName: varchar("display_name", { length: 100 }),
    passwordHash: varchar("password_hash", { length: 350 }).notNull(),
    passwordSalt: varchar("password_salt", { length: 30 }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [unique("users_login_name_unique").on(table.loginName)],
);

export const userRefreshTokensTable = pgTable("user_refresh_tokens", {
  tokenId: serial("token_id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  exp: timestamp("jwt_exp", { mode: "string" }).notNull(),
  jti: text("jwt_jti").notNull(),
});

export const worksTable = pgTable(
  "works",
  {
    workId: serial("work_id").primaryKey(),
    ownerId: integer("owner_id").notNull(),
    slug: varchar({ length: 150 }).notNull(),
    title: varchar({ length: 150 }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [
    unique("works_owner_id_slug_unique").on(table.ownerId, table.slug),
    unique("works_owner_id_title_unique").on(table.ownerId, table.title),
  ],
);

export const workFieldsTable = pgTable(
  "work_fields",
  {
    workFieldId: serial("work_field_id").primaryKey(),
    parentId: integer("parent_id").notNull(),
    displayOrder: integer("display_order").notNull(),
    fieldName: varchar("field_name", { length: 100 }).notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
    fieldType: integer("field_type").notNull(),
    fieldValue: text("field_value").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [
    unique("work_fields_parent_id_field_name_unique").on(
      table.parentId,
      table.fieldName,
    ),
  ],
);

export const workFieldTypesTable = pgTable(
  "work_field_types",
  {
    workFieldTypeId: serial("work_field_type_id").primaryKey(),
    typeName: varchar("type_name", { length: 100 }).notNull(),
  },
  (table) => [unique("work_field_types_type_name_unique").on(table.typeName)],
);
