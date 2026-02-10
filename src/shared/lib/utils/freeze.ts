/**
 * Recursively freezes an object to ensure immutability.
 * Handles circular references and non-enumerable properties.
 *
 * @param obj - The object to freeze
 * @param seen - Internal WeakSet to track processed objects
 * @returns The frozen object
 */
export const deepFreeze = <T>(obj: T, seen = new WeakSet<object>()): T => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (seen.has(obj)) {
    return obj;
  }
  seen.add(obj);

  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const val = (obj as Record<string, unknown>)[prop];

    // Only recurse if the value is an object/function and not already frozen
    if (
      val !== null &&
      (typeof val === "object" || typeof val === "function")
    ) {
      deepFreeze(val, seen);
    }
  });

  return obj;
};
