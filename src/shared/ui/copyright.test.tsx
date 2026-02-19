// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Copyright } from "./copyright";

describe("Copyright Component", () => {
  const FIXED_DATE = new Date("2026-02-19");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with all props provided", () => {
    render(<Copyright author="TestAuthor" year={2024} license="MIT" />);
    screen.getByText((_, element) => {
      const hasText = (node: Element | null) =>
        node?.textContent === "© 2024 TestAuthor MIT.";
      const childrenDontHaveText = Array.from(element?.children || []).every(
        (child) => !hasText(child as Element),
      );
      return hasText(element) && childrenDontHaveText;
    });
  });

  it("renders with current year when year is not provided", () => {
    render(<Copyright author="TestAuthor" license="MIT" />);

    expect(screen.getByText(/2026/)).toBeInTheDocument();
    expect(screen.getByText(/TestAuthor/)).toBeInTheDocument();
    expect(screen.getByText(/MIT/)).toBeInTheDocument();
  });

  it("renders correctly with missing optional props", () => {
    const { rerender } = render(<Copyright year={2024} license="MIT" />);
    screen.getByText((_, element) => {
      const hasText = (node: Element | null) =>
        node?.textContent === "© 2024 MIT.";
      const childrenDontHaveText = Array.from(element?.children || []).every(
        (child) => !hasText(child as Element),
      );
      return hasText(element) && childrenDontHaveText;
    });
    rerender(<Copyright author="TestAuthor" year={2024} />);
    screen.getByText((_, element) => {
      const hasText = (node: Element | null) =>
        node?.textContent === "© 2024 TestAuthor.";
      const childrenDontHaveText = Array.from(element?.children || []).every(
        (child) => !hasText(child as Element),
      );
      return hasText(element) && childrenDontHaveText;
    });
  });

  it("applies custom className", () => {
    const { container } = render(
      <Copyright author="TestAuthor" year={2024} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("accepts year as string", () => {
    render(<Copyright year="2023" author="TestAuthor" />);

    expect(screen.getByText(/2023/)).toBeInTheDocument();
  });

  it("prioritises the year prop over the system clock", () => {
    render(<Copyright year={1999} author="Legacy Corp" />);
    expect(screen.getByText(/1999/)).toBeInTheDocument();
    expect(screen.getByText(/Legacy Corp/i)).toBeInTheDocument();
  });
});
