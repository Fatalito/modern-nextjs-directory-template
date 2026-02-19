import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createSafeFactory } from "./zod-utils";

describe("createSafeFactory", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns validated data and applies overrides", () => {
    const schema = z.object({ name: z.string() }).describe("Person");
    const defaultFactory = (overrides: Partial<{ name: string }> = {}) => ({
      name: "Alice",
      ...overrides,
    });

    const create = createSafeFactory(schema, defaultFactory);

    expect(create()).toEqual({ name: "Alice" });
    expect(create({ name: "Eve" })).toEqual({ name: "Eve" });
  });

  it("reports validation error and includes name identity", () => {
    const schema = z
      .object({ name: z.string(), email: z.string() })
      .describe("User");

    const defaultFactory = (
      overrides: Record<string, unknown> = {},
    ): Record<string, unknown> => ({
      name: "Bob",
      ...overrides,
    });
    const create = createSafeFactory(schema, defaultFactory);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => create()).toThrowError(
      "Mock data divergence detected in User",
    );

    expect(errorSpy).toHaveBeenCalled();
    const firstCall = (errorSpy.mock.calls[0] ?? [""])[0] as string;
    expect(firstCall).toContain('Mock Validation Failed [User] » "Bob"');
  });

  it("reports validation error and includes email identity when name missing", () => {
    const schema = z
      .object({ id: z.string(), email: z.string() })
      .describe("Account");

    const defaultFactory = (
      overrides: Record<string, unknown> = {},
    ): Record<string, unknown> => ({
      email: "bob@example.com",
      ...overrides,
    });

    const create = createSafeFactory(schema, defaultFactory);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => create()).toThrowError(
      "Mock data divergence detected in Account",
    );

    const firstCall = (errorSpy.mock.calls[0] ?? [""])[0] as string;
    expect(firstCall).toContain(
      'Mock Validation Failed [Account] » "bob@example.com"',
    );
  });

  it("reports validation error and includes id identity when name and email missing", () => {
    const schema = z
      .object({ id: z.string(), foo: z.string() })
      .describe("Thing");

    const defaultFactory = (
      overrides: Record<string, unknown> = {},
    ): Record<string, unknown> => ({
      id: "abc-123",
      ...overrides,
    });

    const create = createSafeFactory(schema, defaultFactory);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => create()).toThrowError(
      "Mock data divergence detected in Thing",
    );

    const firstCall = (errorSpy.mock.calls[0] ?? [""])[0] as string;
    expect(firstCall).toContain('Mock Validation Failed [Thing] » "abc-123"');
  });

  it("reports validation error and falls back to Unknown Instance for identity", () => {
    const schema = z.object({ required: z.string() }).describe("Entity");

    const defaultFactory = (): Record<string, unknown> => ({
      foo: "bar",
    });

    const create = createSafeFactory(schema, defaultFactory);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => create()).toThrowError(
      "Mock data divergence detected in Entity",
    );

    const firstCall = (errorSpy.mock.calls[0] ?? [""])[0] as string;
    expect(firstCall).toContain(
      'Mock Validation Failed [Entity] » "Unknown Instance"',
    );
  });

  it("returns Unknown Instance when data is null", () => {
    const schema = z.object({ name: z.string() }).describe("NullEntity");

    const defaultFactory = () => null;

    const create = createSafeFactory(schema, defaultFactory);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => create()).toThrowError(
      "Mock data divergence detected in NullEntity",
    );

    const firstCall = errorSpy.mock.calls[0]?.[0] as string;
    expect(firstCall).toContain(
      'Mock Validation Failed [NullEntity] » "Unknown Instance"',
    );

    errorSpy.mockRestore(); // Always restore spies to prevent test pollution
  });

  it("uses Entity as fallback when schema description is undefined", () => {
    const schema = z.object({ name: z.string() });

    const defaultFactory = (): Record<string, unknown> => ({ name: 123 });

    const create = createSafeFactory(schema, defaultFactory);

    expect(() => create()).toThrowError(
      "Mock data divergence detected in Entity",
    );
  });
});
