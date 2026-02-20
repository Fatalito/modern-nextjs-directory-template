// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Copyright } from "./copyright";

const COPYRIGHT_YEAR_REGEX = /2026/;
const AUTHOR_REGEX = /TestAuthor/;
const LICENSE_REGEX = /MIT/;
const LEGACY_YEAR_REGEX = /1999/;
const LEGACY_AUTHOR_REGEX = /Legacy Corp/i;

const hasExactTextContent =
  (text: string) => (_: string, element: Element | null) => {
    const isMatch = (node: Element | null) => node?.textContent === text;
    return (
      isMatch(element) &&
      Array.from(element?.children ?? []).every(
        (child) => !isMatch(child as Element),
      )
    );
  };

describe("Copyright Component", () => {
  const fixedDate = new Date("2026-02-19");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with all props provided", () => {
    render(<Copyright author="TestAuthor" year={2024} license="MIT" />);
    expect(
      screen.getByText(hasExactTextContent("© 2024 TestAuthor MIT.")),
    ).toBeInTheDocument();
  });

  it("renders with current year when year is not provided", () => {
    render(<Copyright author="TestAuthor" license="MIT" />);

    expect(screen.getByText(COPYRIGHT_YEAR_REGEX)).toBeInTheDocument();
    expect(screen.getByText(AUTHOR_REGEX)).toBeInTheDocument();
    expect(screen.getByText(LICENSE_REGEX)).toBeInTheDocument();
  });

  it("renders correctly with missing author prop", () => {
    render(<Copyright year={2024} license="MIT" />);
    expect(
      screen.getByText(hasExactTextContent("© 2024 MIT.")),
    ).toBeInTheDocument();
  });

  it("renders correctly with missing license props", () => {
    render(<Copyright author="TestAuthor" year={2024} />);
    expect(
      screen.getByText(hasExactTextContent("© 2024 TestAuthor.")),
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Copyright author="TestAuthor" year={2024} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("prioritises the year prop over the system clock", () => {
    render(<Copyright year={1999} author="Legacy Corp" />);
    expect(screen.getByText(LEGACY_YEAR_REGEX)).toBeInTheDocument();
    expect(screen.getByText(LEGACY_AUTHOR_REGEX)).toBeInTheDocument();
  });
});
