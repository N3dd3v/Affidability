import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FriendScheduleGrid } from "@/components/availability/FriendScheduleGrid";

function expectAllCellsToMatch(
  testId: string,
  expectedState: string,
  expectedClass: string,
) {
  const cells = screen.getAllByTestId(testId);

  expect(cells.length).toBeGreaterThan(0);

  for (const cell of cells) {
    expect(cell).toHaveAttribute("data-state", expectedState);
    expect(cell).toHaveClass(expectedClass);
  }
}

describe("FriendScheduleGrid", () => {
  it("renders friend-only, own-only, and overlap cells with distinct states", () => {
    render(
      <FriendScheduleGrid
        ownSlots={[
          {
            id: "own-overlap",
            user_id: "me",
            day_of_week: 1,
            start_time: "08:00",
            end_time: "12:00",
            status: "free",
          },
          {
            id: "own-only",
            user_id: "me",
            day_of_week: 2,
            start_time: "16:00",
            end_time: "20:00",
            status: "free",
          },
        ]}
        friendSlots={[
          {
            id: "friend-overlap",
            user_id: "friend",
            day_of_week: 1,
            start_time: "08:00",
            end_time: "12:00",
            status: "free",
          },
          {
            id: "friend-only",
            user_id: "friend",
            day_of_week: 1,
            start_time: "12:00",
            end_time: "16:00",
            status: "free",
          },
        ]}
      />,
    );

    expectAllCellsToMatch(
      "friend-schedule-cell-1:08:00-12:00",
      "overlap",
      "bg-emerald-500/20",
    );
    expectAllCellsToMatch(
      "friend-schedule-cell-1:12:00-16:00",
      "friend",
      "bg-emerald-500/12",
    );
    expectAllCellsToMatch(
      "friend-schedule-cell-2:16:00-20:00",
      "own",
      "bg-neutral-100",
    );
  });

  it("does not render busy slots as active", () => {
    render(
      <FriendScheduleGrid
        ownSlots={[
          {
            id: "own-busy",
            user_id: "me",
            day_of_week: 4,
            start_time: "20:00",
            end_time: "23:00",
            status: "busy",
          },
        ]}
        friendSlots={[
          {
            id: "friend-busy",
            user_id: "friend",
            day_of_week: 4,
            start_time: "20:00",
            end_time: "23:00",
            status: "busy",
          },
        ]}
      />,
    );

    expectAllCellsToMatch(
      "friend-schedule-cell-4:20:00-23:00",
      "unavailable",
      "bg-neutral-50",
    );
  });

  it("renders an empty grid without crashing when the friend has zero slots", () => {
    render(<FriendScheduleGrid ownSlots={[]} friendSlots={[]} />);

    expect(screen.getByText("Friend schedule")).toBeInTheDocument();
    expectAllCellsToMatch(
      "friend-schedule-cell-1:08:00-12:00",
      "unavailable",
      "bg-neutral-50",
    );
  });
});
