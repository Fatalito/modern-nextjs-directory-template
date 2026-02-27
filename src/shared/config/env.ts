import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const serverSchema = z.object({
  ENABLE_HSTS: z
    .string()
    .default("false")
    .transform((v) => v.trim().toLowerCase() === "true"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_OUTPUT_MODE: z
    .enum(["serverless", "static", "standalone"])
    .default("serverless"),
  DATABASE_URL: z.url().optional(),
  DATABASE_AUTH_TOKEN: z.string().optional(),
});

export const env = createEnv({
  server: serverSchema.shape,
  client: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    ENABLE_HSTS: process.env.ENABLE_HSTS,
    NEXT_OUTPUT_MODE: process.env.NEXT_OUTPUT_MODE,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
