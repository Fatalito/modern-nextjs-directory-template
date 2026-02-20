/**
 * Wrapper for generateStaticParams to catch errors and return an empty array instead of crashing the build.
 * @param loader - Async function that loads the static params (e.g., fetching from DB or API)
 * @param pageContext - A string to identify which page's params are being loaded (used for logging)
 * @returns Array of static params or an empty array if an error occurs
 */

export async function safeGenerateStaticParams<T>(
  loader: () => Promise<T[]>,
  pageContext: string,
): Promise<T[]> {
  try {
    return await loader();
  } catch (error) {
    console.error(
      `[generateStaticParams] Failed to load static paths for ${pageContext}:`,
      error,
    );
    return [];
  }
}
