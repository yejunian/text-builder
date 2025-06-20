function getDatabaseUrl() {
  if (process.env.VERCEL === "1") {
    return process.env.LIVE_PROD_DATABASE_URL ?? "";
  }

  if (process.env.NODE_ENV === "production") {
    return process.env.LIVE_DEV_DATABASE_URL ?? "";
  }

  return process.env.LOCAL_DATABASE_URL ?? "";
}

export const ENV_DATABASE_URL = getDatabaseUrl();

export const ENV_SECRET_ACCESS_TOKEN = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET,
);

export const ENV_SECRET_REFRESH_TOKEN = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET,
);
