import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BusinessDirectoryLayout } from "./business-directory-layout";

describe("BusinessDirectoryLayout", () => {
  it("renders title, description, filters, and children", () => {
    render(
      <BusinessDirectoryLayout
        title="Directory Title"
        description="Directory description"
        filters={<div>Filters UI</div>}
        author="Test Author"
        license="MIT"
      >
        <div>Directory content</div>
      </BusinessDirectoryLayout>,
    );

    expect(
      screen.getByRole("heading", { name: "Directory Title" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Directory description")).toBeInTheDocument();
    expect(screen.getByText("Filters UI")).toBeInTheDocument();
    expect(screen.getByText("Directory content")).toBeInTheDocument();
    expect(screen.getByText(/Test Author/i)).toBeInTheDocument();
    expect(screen.getByText(/MIT/i)).toBeInTheDocument();
  });
});
