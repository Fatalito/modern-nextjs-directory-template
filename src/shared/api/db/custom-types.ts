import { customType } from "drizzle-orm/sqlite-core";

export const jsonColumnConfig = <TData>() => ({
  dataType() {
    return "text";
  },
  fromDriver(value: string): TData {
    try {
      return JSON.parse(value);
    } catch {
      return [] as unknown as TData;
    }
  },
  toDriver(value: TData): string {
    return JSON.stringify(value);
  },
});

/**
 * A custom SQLite type that handles JSON stringification and parsing automatically.
 * @param name - The name of the column in the database.
 * @returns A Drizzle custom type that can be used in table definitions.
 */
export const jsonColumn = <TData>(name: string) =>
  customType<{ data: TData; driverData: string }>(jsonColumnConfig<TData>())(
    name,
  );
