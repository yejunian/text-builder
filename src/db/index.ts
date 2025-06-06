import { drizzle } from "drizzle-orm/node-postgres";

import { ENV_DATABASE_URL } from "@/utils/server/env";

export const db = drizzle(ENV_DATABASE_URL);
