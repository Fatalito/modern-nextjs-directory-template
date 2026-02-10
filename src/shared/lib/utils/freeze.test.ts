import { describe, expect, it } from "vitest";
import { deepFreeze } from "./freeze";

describe("deepFreeze", () => {
  describe("Primitives and Null", () => {
    it("should return primitives unchanged", () => {
      expect(deepFreeze(1)).toBe(1);
      expect(deepFreeze("string")).toBe("string");
      expect(deepFreeze(true)).toBe(true);
      expect(deepFreeze(null)).toBe(null);
      expect(deepFreeze(undefined)).toBe(undefined);
    });
  });

  describe("Simple Objects", () => {
    it("should freeze a plain object", () => {
      const obj = { a: 1, b: "test" };
      const frozen = deepFreeze(obj);

      expect(Object.isFrozen(frozen)).toBe(true);
      expect(frozen).toBe(obj);
    });

    it("should prevent property addition", () => {
      const obj = { a: 1 };
      deepFreeze(obj);

      expect(() => {
        (obj as Record<string, unknown>).b = 2;
      }).toThrow(TypeError);
    });

    it("should prevent property modification", () => {
      const obj = { a: 1 };
      deepFreeze(obj);

      expect(() => {
        (obj as Record<string, unknown>).a = 2;
      }).toThrow(TypeError);
    });
  });

  describe("Nested Structures", () => {
    it("should recursively freeze nested objects", () => {
      const obj = {
        level1: {
          level2: {
            value: "deep",
          },
        },
      };

      deepFreeze(obj);

      expect(Object.isFrozen(obj)).toBe(true);
      expect(Object.isFrozen(obj.level1)).toBe(true);
      expect(Object.isFrozen(obj.level1.level2)).toBe(true);
    });

    it("should recursively freeze arrays", () => {
      const arr = [1, 2, [3, 4]];

      deepFreeze(arr);

      expect(Object.isFrozen(arr)).toBe(true);
      expect(Object.isFrozen(arr[2])).toBe(true);
    });

    it("should freeze mixed structures (objects with arrays)", () => {
      const obj = {
        data: [{ id: 1 }, { id: 2 }],
        meta: { count: 2 },
      };

      deepFreeze(obj);

      expect(Object.isFrozen(obj)).toBe(true);
      expect(Object.isFrozen(obj.data)).toBe(true);
      expect(Object.isFrozen(obj.data[0])).toBe(true);
      expect(Object.isFrozen(obj.meta)).toBe(true);
    });
  });

  describe("Circular References", () => {
    interface Circular {
      name: string;
      self?: Circular;
      ref?: Circular;
    }

    it("should handle circular references without stack overflow", () => {
      const obj: Circular = { name: "Parent" };
      obj.self = obj;

      const frozen = deepFreeze(obj);

      expect(Object.isFrozen(frozen)).toBe(true);
      expect(frozen.self).toBe(frozen);
    });

    it("should handle complex circular graphs", () => {
      const a: Circular = { name: "A" };
      const b: Circular = { name: "B" };
      const c: Circular = { name: "C" };

      a.ref = b;
      b.ref = c;
      c.ref = a;

      const frozen = deepFreeze(a);

      expect(Object.isFrozen(frozen)).toBe(true);
      expect(Object.isFrozen(frozen.ref)).toBe(true);
      expect(Object.isFrozen(frozen.ref?.ref)).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should not throw if object is already frozen", () => {
      const obj = Object.freeze({ a: 1 });

      expect(() => deepFreeze(obj)).not.toThrow();
      expect(Object.isFrozen(obj)).toBe(true);
    });

    it("should handle empty objects and arrays", () => {
      expect(Object.isFrozen(deepFreeze({}))).toBe(true);
      expect(Object.isFrozen(deepFreeze([]))).toBe(true);
    });

    it("should handle non-enumerable properties", () => {
      const obj = {};
      Object.defineProperty(obj, "hidden", {
        value: { internal: "data" },
        enumerable: false,
        configurable: true,
        writable: true,
      });

      deepFreeze(obj);

      expect(Object.isFrozen(obj)).toBe(true);

      const descriptor = Object.getOwnPropertyDescriptor(obj, "hidden");
      expect(descriptor?.configurable).toBe(false);
      expect(descriptor?.writable).toBe(false);
    });
  });
});
