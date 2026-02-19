import { vi } from "vitest";

export const createReactCacheMock = () => ({
  cache: <Args extends unknown[], Return>(
    fn: (...args: Args) => Return,
  ): ((...args: Args) => Return) => {
    // tracker.mock.calls is reset by vi.clearAllMocks() in beforeEach.
    // Do not switch to vi.resetAllMocks() or remove the beforeEach guard —
    // the cache would permanently return the first test's stale result.
    const tracker = vi.fn();
    let result: Return;

    return (...args: Args): Return => {
      if (tracker.mock.calls.length === 0) {
        result = fn(...args);
        tracker(...args);
      }
      return result;
    };
  },
});
