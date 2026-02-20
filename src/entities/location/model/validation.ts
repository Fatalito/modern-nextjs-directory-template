import type { Location } from "@/shared/model";

/**
 * Validates the hierarchical relationship between locations.
 * Utilise this to prevent "URL squatting" (e.g., /uk/paris).
 * @param child - The location being validated as a child.
 * @param parent - The location being validated as a parent.
 * @returns True if the child is a direct child of the parent, false otherwise.
 */
export const isLocationChildOf = (
  child: Location | undefined | null,
  parent: Location | undefined | null,
): boolean => {
  if (!child || !parent) return false;
  return child.parentId === parent.id;
};
