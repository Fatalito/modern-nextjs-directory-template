import { selectBusinessesByCriteria } from "@/entities/business";
import { getBaseDirectoryData } from "./base";
import type { DirectoryPageData, SearchCriteria } from "./types";

/**
 * A generic loader that fetches route-specific entities and global directory data in parallel,
 * then applies the business selector.
 *
 * @template TEntities - The shape of the route-specific entities (e.g., { city, country })
 * @param entityFetcher - A cached function fetching the specific entities (or undefined if 404)
 * @param criteriaBuilder - A function to map the entities into SearchCriteria for the business selector
 */
export async function createDirectoryLoader<TEntities>(
  entityFetcher: () => Promise<TEntities | undefined>,
  criteriaBuilder: (entities: TEntities) => SearchCriteria,
): Promise<DirectoryPageData<TEntities> | undefined> {
  const [entities, baseData] = await Promise.all([
    entityFetcher(),
    getBaseDirectoryData(),
  ]);

  if (!entities) return undefined;

  const criteria = criteriaBuilder(entities);

  return {
    entities,
    filters: baseData.filters,
    results: selectBusinessesByCriteria(baseData.allBusinesses, criteria),
  };
}
