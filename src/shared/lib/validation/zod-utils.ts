import { z } from "zod";

/**
 * Provides a human-readable identifier for the given data object,
 * @param data - The data object to extract identity from
 * @returns A string identifier (name, email, or id) or "Unknown Instance" if not found
 */
const getIdentity = (data: unknown): string => {
  if (typeof data === "object" && data !== null) {
    const d = data as Record<string, unknown>;

    if (typeof d.name === "string") return d.name;
    if (typeof d.email === "string") return d.email;
    if (typeof d.id === "string") return d.id;
  }
  return "Unknown Instance";
};

/**
 * Logs a detailed error message and throws an exception to indicate mock data divergence.
 * @param error - The ZodError to report
 * @param label - Label to identify the context of the error
 * @param data - The original data that failed validation, used for identity extraction
 */
const reportValidationError = (
  error: z.ZodError,
  label: string,
  data: unknown,
) => {
  const identity = getIdentity(data);
  console.error(`\n❌ Mock Validation Failed [${label}] » "${identity}"`);
  console.error(JSON.stringify(z.treeifyError(error), null, 2));
  console.error("---");
  throw new Error(`Mock data divergence detected in ${label}`);
};

/**
 * Factory creator that validates generated mock data against a Zod schema.
 * @param schema - The Zod schema to validate against
 * @param defaultFactory - A function that generates mock data with optional overrides
 * @returns A factory function that produces validated mock data
 */

export const createSafeFactory = <T extends object>(
  schema: z.ZodType<T>,
  defaultFactory: (overrides: Partial<T>) => T,
) => {
  return (overrides: Partial<T> = {}): T => {
    const data = defaultFactory(overrides);
    const result = schema.safeParse(data);

    if (!result.success) {
      reportValidationError(result.error, schema.description ?? "Entity", data);
    }

    return result.data as T;
  };
};
