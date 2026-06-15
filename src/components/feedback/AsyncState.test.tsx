import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AsyncState } from "./AsyncState";

describe("AsyncState", () => {
  it("renders a loading placeholder", () => {
    const { container } = render(
      <AsyncState loading>
        <div>Loaded</div>
      </AsyncState>,
    );

    expect(container.querySelector(".ant-skeleton")).toBeInTheDocument();
    expect(screen.queryByText("Loaded")).not.toBeInTheDocument();
  });

  it("renders a normalized error state", () => {
    render(
      <AsyncState error={{ status: 500, message: "Backend unavailable" }}>
        <div>Loaded</div>
      </AsyncState>,
    );

    expect(screen.getByText("Unable to load data")).toBeInTheDocument();
    expect(screen.getByText("Backend unavailable")).toBeInTheDocument();
  });

  it("renders an empty state", () => {
    render(
      <AsyncState empty emptyDescription="Nothing here">
        <div>Loaded</div>
      </AsyncState>,
    );

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders children when ready", () => {
    render(
      <AsyncState>
        <div>Loaded</div>
      </AsyncState>,
    );

    expect(screen.getByText("Loaded")).toBeInTheDocument();
  });
});
