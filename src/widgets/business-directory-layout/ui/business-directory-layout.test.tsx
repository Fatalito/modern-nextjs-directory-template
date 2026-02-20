// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BusinessDirectoryLayout } from "./business-directory-layout";

describe("BusinessDirectoryLayout", () => {
  it("renders title, description, filters, and children", () => {
    const props = {
      title: "Directory Title",
      description: "Directory description",
      filters: <div data-testid="filter-container">Filters UI</div>,
      author: "Test Author",
      license: "MIT",
    };

    render(
      <BusinessDirectoryLayout {...props}>
        <div data-testid="main-content">Directory content</div>
      </BusinessDirectoryLayout>,
    );

    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
    expect(header).toContainElement(screen.getByTestId("filter-container"));
    expect(header).toContainElement(
      screen.getByRole("heading", { level: 1, name: props.title }),
    );
    expect(header).toContainElement(screen.getByText(props.description));

    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toContainElement(screen.getByTestId("main-content"));

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveTextContent(props.author);
    expect(footer).toHaveTextContent(props.license);
  });
});
