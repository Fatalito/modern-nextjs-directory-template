import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Copyright } from "./copyright";

describe("Copyright Component", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with all props provided", () => {
    render(<Copyright author="TestAuthor" year={2024} license="MIT" />);

    expect(screen.getByText(/© 2024 TestAuthor MIT\./)).toBeInTheDocument();
  });

  it("renders with current year when year is not provided", () => {
    const currentYear = new Date().getFullYear();
    render(<Copyright author="TestAuthor" license="MIT" />);

    expect(
      screen.getByText(
        new RegExp(String.raw`© ${currentYear} TestAuthor MIT\.`),
      ),
    ).toBeInTheDocument();
  });

  it("renders without author when not provided", () => {
    render(<Copyright year={2024} license="MIT" />);

    expect(screen.getByText(/© 2024 MIT\./)).toBeInTheDocument();
  });

  it("renders without license when not provided", () => {
    render(<Copyright author="TestAuthor" year={2024} />);

    expect(screen.getByText(/© 2024 TestAuthor\./)).toBeInTheDocument();
  });

  it("renders with only year when author and license are omitted", () => {
    render(<Copyright year={2024} />);

    expect(screen.getByText(/© 2024\./)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Copyright author="TestAuthor" year={2024} className="custom-class" />,
    );

    const element = container.querySelector(".custom-class");
    expect(element).toBeInTheDocument();
  });

  it("accepts year as string", () => {
    render(<Copyright year="2023" author="TestAuthor" />);

    expect(screen.getByText(/© 2023 TestAuthor\./)).toBeInTheDocument();
  });

  it("uses current year from Date when no year prop is provided", () => {
    const mockDate = new Date("2025-06-15");
    vi.setSystemTime(mockDate);

    render(<Copyright author="TestAuthor" />);

    expect(screen.getByText(/© 2025 TestAuthor\./)).toBeInTheDocument();
  });
});
