import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";

import { availabilityKey } from "@/lib/availability-view";
import { useAvailability } from "@/hooks/useAvailability";

const {
  createAvailabilitySlotMock,
  deleteAvailabilitySlotMock,
  getAcceptedFriendAvailabilityMock,
  getMyAvailabilityMock,
  createClientMock,
  getUserMock,
} = vi.hoisted(() => ({
  createAvailabilitySlotMock: vi.fn(),
  deleteAvailabilitySlotMock: vi.fn(),
  getAcceptedFriendAvailabilityMock: vi.fn(),
  getMyAvailabilityMock: vi.fn(),
  createClientMock: vi.fn(),
  getUserMock: vi.fn(),
}));

vi.mock("@/lib/availability", () => ({
  createAvailabilitySlot: createAvailabilitySlotMock,
  deleteAvailabilitySlot: deleteAvailabilitySlotMock,
  getAcceptedFriendAvailability: getAcceptedFriendAvailabilityMock,
  getMyAvailability: getMyAvailabilityMock,
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: createClientMock,
}));

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("useAvailability", () => {
  const mockSupabase = {
    auth: {
      getUser: getUserMock,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    createClientMock.mockReturnValue(mockSupabase);
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    getMyAvailabilityMock.mockResolvedValue([]);
    getAcceptedFriendAvailabilityMock.mockResolvedValue([]);
  });

  async function renderAvailabilityHook() {
    const view = renderHook(() => useAvailability());

    await waitFor(() => {
      expect(view.result.current.initializing).toBe(false);
    });

    return view;
  }

  it("clicking an empty slot calls insert and adds it to selectedKeys", async () => {
    createAvailabilitySlotMock.mockResolvedValue({
      id: "slot-1",
      user_id: "user-1",
      day_of_week: 1,
      start_time: "08:00",
      end_time: "12:00",
      status: "free",
    });

    const view = await renderAvailabilityHook();
    const key = availabilityKey(1, "08:00", "12:00");

    await act(async () => {
      await view.result.current.toggleSlot(1, "08:00", "12:00");
    });

    expect(createAvailabilitySlotMock).toHaveBeenCalledWith(
      mockSupabase,
      "user-1",
      {
        day_of_week: 1,
        start_time: "08:00",
        end_time: "12:00",
        status: "free",
      },
    );
    expect(view.result.current.selectedKeys.has(key)).toBe(true);
  });

  it("clicking an existing slot calls delete and removes it", async () => {
    getMyAvailabilityMock.mockResolvedValue([
      {
        id: "slot-1",
        user_id: "user-1",
        day_of_week: 1,
        start_time: "08:00",
        end_time: "12:00",
        status: "free",
      },
    ]);
    deleteAvailabilitySlotMock.mockResolvedValue(undefined);

    const view = await renderAvailabilityHook();
    const key = availabilityKey(1, "08:00", "12:00");

    expect(view.result.current.selectedKeys.has(key)).toBe(true);

    await act(async () => {
      await view.result.current.toggleSlot(1, "08:00", "12:00");
    });

    expect(deleteAvailabilitySlotMock).toHaveBeenCalledWith(
      mockSupabase,
      "slot-1",
      "user-1",
    );
    expect(createAvailabilitySlotMock).not.toHaveBeenCalled();
    expect(view.result.current.selectedKeys.has(key)).toBe(false);
  });

  it("a failed insert pushes an error toast and does not add the slot", async () => {
    createAvailabilitySlotMock.mockRejectedValue(new Error("Insert failed"));

    const view = await renderAvailabilityHook();
    const key = availabilityKey(1, "08:00", "12:00");

    await act(async () => {
      await view.result.current.toggleSlot(1, "08:00", "12:00");
    });

    expect(view.result.current.selectedKeys.has(key)).toBe(false);
    expect(view.result.current.toasts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "error",
          message: "Insert failed",
        }),
      ]),
    );
  });

  it("marks a slot pending during the operation and clears it after", async () => {
    const deferred = createDeferred<{
      id: string;
      user_id: string;
      day_of_week: number;
      start_time: string;
      end_time: string;
      status: "free";
    }>();
    createAvailabilitySlotMock.mockReturnValue(deferred.promise);

    const view = await renderAvailabilityHook();
    const key = availabilityKey(1, "08:00", "12:00");

    let togglePromise!: Promise<void>;

    act(() => {
      togglePromise = view.result.current.toggleSlot(1, "08:00", "12:00");
    });

    await waitFor(() => {
      expect(view.result.current.pendingByKey[key]).toBe(true);
    });

    deferred.resolve({
      id: "slot-1",
      user_id: "user-1",
      day_of_week: 1,
      start_time: "08:00",
      end_time: "12:00",
      status: "free",
    });

    await act(async () => {
      await togglePromise;
    });

    await waitFor(() => {
      expect(view.result.current.pendingByKey[key]).toBeUndefined();
    });
  });
});
