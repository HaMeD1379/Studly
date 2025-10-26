import { screen } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";
import { render } from "~/utilities/testing";
import { StudySession } from "./StudySession";

const mockOnStart = vi.fn();
const mockOnStop = vi.fn();

describe("StudySession", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
  });

  it("renders", () => {
    render(<StudySession onStartStudy={mockOnStart} onStopStudy={mockOnStop} />);

    expect(screen.getByText("Current Session")).not.toBeNull();
    expect(screen.getByText("Configure your study session")).not.toBeNull();
    expect(screen.getByText("00:00")).not.toBeNull();
    expect(screen.getByText("0 seconds remaining")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Start" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Stop" })).not.toBeNull();
  });

  it("clicking start study session calls functions and disables self", async () => {
    vi.setSystemTime("2025-01-01");

    let mockStartTimestamp = 0;
    let mockEndTimestamp = 0;

    const { rerender } = render(
      <StudySession
        startStudyTimestamp={mockStartTimestamp}
        endStudyTimestamp={mockEndTimestamp}
        onStartStudy={mockOnStart}
        onStopStudy={mockOnStop}
      />
    );

    const startButton = screen.getByRole("button", { name: "Start" });
    const stopButton = screen.getByRole("button", { name: "Stop" });

    expect(startButton.getAttribute("disabled")).toBeNull();
    expect(stopButton.getAttribute("disabled")).not.toBeNull();

    startButton.click();

    expect(mockOnStart).toHaveBeenCalled();

    mockStartTimestamp = Date.now();
    mockEndTimestamp = Date.now() + 60000;

    rerender(
      <StudySession
        startStudyTimestamp={mockStartTimestamp}
        endStudyTimestamp={mockEndTimestamp}
        onStartStudy={mockOnStart}
        onStopStudy={mockOnStop}
      />
    );

    expect(
      screen.getByRole("button", { name: "Start" }).getAttribute("disabled")
    ).not.toBeNull();
  });

  it("clicking stop study session calls functions and disables self", async () => {
    vi.setSystemTime("2025-01-01");

    const mockStartTimestamp = Date.now();
    const mockEndTimestamp = Date.now() + 60000;

    const { rerender } = render(
      <StudySession
        startStudyTimestamp={mockStartTimestamp}
        endStudyTimestamp={mockEndTimestamp}
        onStartStudy={mockOnStart}
        onStopStudy={mockOnStop}
      />
    );
    const stopButton = screen.getByRole("button", { name: "Stop" });

    expect(stopButton.getAttribute("disabled")).toBeNull();

    stopButton.click();

    expect(mockOnStop).toHaveBeenCalled();

    rerender(
      <StudySession
        startStudyTimestamp={0}
        endStudyTimestamp={0}
        onStartStudy={mockOnStart}
        onStopStudy={mockOnStop}
      />
    );
    expect(
      screen.getByRole("button", { name: "Stop" }).getAttribute("disabled")
    ).not.toBeNull();
  });

  it("giving a start and end timestamp starts the countdown", () => {
    vi.setSystemTime("2025-01-01");

    const mockStartTimestamp = Date.now();
    const mockEndTimestamp = mockStartTimestamp + 3600000;
    render(
      <StudySession
        startStudyTimestamp={mockStartTimestamp}
        endStudyTimestamp={mockEndTimestamp}
        onStartStudy={mockOnStart}
        onStopStudy={mockOnStop}
      />
    );

    expect(screen.getByText("1:00")).not.toBeNull();
    expect(screen.getByText("1 hours and 0 minutes remaining")).not.toBeNull();
  });

  it("giving start > end results in onStop being called", () => {
    vi.setSystemTime("2025-01-01");

    const mockStartTimestamp = Date.now();
    const mockEndTimestamp = mockStartTimestamp - 1000;
    render(
      <StudySession
        startStudyTimestamp={mockStartTimestamp}
        endStudyTimestamp={mockEndTimestamp}
        onStartStudy={mockOnStart}
        onStopStudy={mockOnStop}
      />
    );

    expect(mockOnStop).toHaveBeenCalled();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
