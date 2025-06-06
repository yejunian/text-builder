export const ENV_DATABASE_URL = process.env.DATABASE_URL ?? "";

export const ENV_SECRET_ACCESS_TOKEN = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET,
);

export const ENV_SECRET_REFRESH_TOKEN = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET,
);
