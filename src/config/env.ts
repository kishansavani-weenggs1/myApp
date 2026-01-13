import "dotenv/config";

const getEnv = (key: string, required = true): string => {
  const value = process.env[key];

  if (!value && required) {
    throw new Error(`Environment variable ${key} is missing !!`);
  }

  return value ?? "";
};

export const ENV = {
  NODE_ENV: getEnv("NODE_ENV", false) || "development",
  APP_PORT: Number(getEnv("APP_PORT", false)) || 3000,
  REDIS_PORT: Number(getEnv("REDIS_PORT", false)) || 6379,

  DB: {
    HOST: getEnv("DB_HOST"),
    NAME: getEnv("DB_NAME"),
    USER: getEnv("DB_USER"),
    PASSWORD: getEnv("DB_PASSWORD"),
  },

  JWT: {
    ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
    REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
    ACCESS_EXPIRES_IN: Number(getEnv("JWT_ACCESS_EXPIRES_IN_HOURS")) * 60 * 60,
    REFRESH_EXPIRES_IN:
      Number(getEnv("JWT_REFRESH_EXPIRES_IN_DAYS")) * 24 * 60 * 60,
  },
};
