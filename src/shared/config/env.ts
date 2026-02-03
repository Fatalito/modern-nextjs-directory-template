import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    ENABLE_HSTS: z
      .string()
      .default("false")
      .transform((v) => v.trim().toLowerCase() === "true"),
    NEXT_OUTPUT_MODE: z
      .enum(["serverless", "static", "standalone"])
      .default("serverless"),
  },
  client: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    ENABLE_HSTS: process.env.ENABLE_HSTS,
    NEXT_OUTPUT_MODE: process.env.NEXT_OUTPUT_MODE,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
