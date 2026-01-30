import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// Automatically unmount React trees after each test to prevent memory leaks
// and state bleeding between tests.
afterEach(() => {
  cleanup();
});
