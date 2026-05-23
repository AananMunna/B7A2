import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

export const config = {
  port: process.env["PORT"] ?? "5000",
  databaseUrl: process.env["DATABASE_URL"] as string,
  jwtSecret: process.env["JWT_SECRET"] as string,
};
