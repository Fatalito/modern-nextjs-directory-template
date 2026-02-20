import type { FilterCriteria } from "@/shared/model";
import { getBaseDirectoryData } from "./base";
import type { DirectoryPageData } from "./types";

/**
 * A generic loader that fetches route-specific entities and global directory data.
 *
 * @template TEntities - The shape of the route-specific entities (e.g., { city, country })
 * @param entityFetcher - A cached function fetching the specific entities (or undefined if 404)
 * @param criteriaBuilder - A function to map the entities into FilterCriteria for the business selector
 */
export const loadDirectoryPageData = async <TEntities>(
  entityFetcher: () => Promise<TEntities | undefined>,
  criteriaBuilder: (entities: TEntities) => FilterCriteria,
): Promise<DirectoryPageData<TEntities> | undefined> => {
  const entities = await entityFetcher();
  if (!entities) return undefined;

  const criteria = criteriaBuilder(entities);

  const { businesses, filters } = await getBaseDirectoryData(criteria);
  return {
    entities,
    filters,
    results: businesses,
  };
};
