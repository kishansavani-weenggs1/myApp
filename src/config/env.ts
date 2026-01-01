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

  DB: {
    HOST: getEnv("DB_HOST"),
    NAME: getEnv("DB_NAME"),
    USER: getEnv("DB_USER"),
    PASSWORD: getEnv("DB_PASSWORD"),
  },

  JWT: {
    ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
    REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
    EXPIRES_IN: getEnv("JWT_EXPIRES_IN", false) || 86400, // 1 day default
  },
};
