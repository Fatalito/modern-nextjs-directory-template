import { z } from "zod";

/**
 * Slug validation schema for URL-friendly identifiers.
 * Ensures lowercase alphanumeric characters with optional hyphens between words.
 * Does not allow leading/trailing hyphens or consecutive hyphens.
 */
export const SlugSchema = z
  .string()
  .min(2)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be URL-friendly");
