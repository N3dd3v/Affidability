import { describe, expect, it } from "vitest";

import {
  createAvailabilitySlot,
  getAcceptedFriendAvailability,
  getFriendDetail,
  getMyAvailability,
  normalizeSlot,
  normalizeTime,
  type AvailabilitySlot,
} from "@/lib/availability";
import { createSupabaseMock } from "@/lib/__tests__/supabase-mock";

const POSTGRES_SLOT: AvailabilitySlot = {
  id: "slot-1",
  user_id: "user-1",
  day_of_week: 1,
  start_time: "08:00:00",
  end_time: "12:00:00",
  status: "free",
};

describe("availability", () => {
  describe("normalize helpers", () => {
    it("normalizes Postgres time values to HH:MM", () => {
      expect(normalizeTime("08:00:00")).toBe("08:00");
    });

    it("leaves already-normalized times unchanged", () => {
      expect(normalizeTime("08:00")).toBe("08:00");
    });

    it("normalizes slot times consistently", () => {
      expect(normalizeSlot(POSTGRES_SLOT)).toEqual({
        ...POSTGRES_SLOT,
        start_time: "08:00",
        end_time: "12:00",
      });
    });
  });

  describe("getMyAvailability", () => {
    it("returns normalized slots", async () => {
      const { client } = createSupabaseMock({
        availabilities: [{ data: [POSTGRES_SLOT], error: null }],
      });

      await expect(getMyAvailability(client, "user-1")).resolves.toEqual([
        {
          ...POSTGRES_SLOT,
          start_time: "08:00",
          end_time: "12:00",
        },
      ]);
    });

    it("throws when Supabase returns an error", async () => {
      const { client } = createSupabaseMock({
        availabilities: [{ data: null, error: { message: "query failed" } }],
      });

      await expect(getMyAvailability(client, "user-1")).rejects.toEqual({
        message: "query failed",
      });
    });
  });

  describe("createAvailabilitySlot", () => {
    it("sends the expected insert payload and normalizes the returned row", async () => {
      const { client, states } = createSupabaseMock({
        availabilities: [{ data: POSTGRES_SLOT, error: null }],
      });

      const result = await createAvailabilitySlot(client, "user-1", {
        day_of_week: 1,
        start_time: "08:00",
        end_time: "12:00",
        status: "free",
      });

      expect(states[0]?.insertPayload).toEqual({
        user_id: "user-1",
        day_of_week: 1,
        start_time: "08:00",
        end_time: "12:00",
        status: "free",
      });
      expect(result).toEqual({
        ...POSTGRES_SLOT,
        start_time: "08:00",
        end_time: "12:00",
      });
    });
  });

  describe("getAcceptedFriendAvailability", () => {
    it("returns an empty array when there are no accepted friendships", async () => {
      const { client, states } = createSupabaseMock({
        friendships: [{ data: [], error: null }],
      });

      await expect(getAcceptedFriendAvailability(client, "me")).resolves.toEqual([]);
      expect(states).toHaveLength(1);
      expect(states[0]?.table).toBe("friendships");
    });

    it("maps friend ids from both sender and receiver sides and groups slots per profile", async () => {
      const { client, states } = createSupabaseMock({
        friendships: [
          {
            data: [
              { sender_id: "me", receiver_id: "friend-a", status: "accepted" },
              { sender_id: "friend-b", receiver_id: "me", status: "accepted" },
            ],
            error: null,
          },
        ],
        profiles: [
          {
            data: [
              {
                id: "friend-b",
                username: "bravo",
                display_name: "Bravo",
                avatar_url: null,
              },
              {
                id: "friend-a",
                username: "alpha",
                display_name: "Alpha",
                avatar_url: null,
              },
            ],
            error: null,
          },
        ],
        availabilities: [
          {
            data: [
              {
                id: "slot-a",
                user_id: "friend-a",
                day_of_week: 1,
                start_time: "08:00:00",
                end_time: "12:00:00",
                status: "free",
              },
              {
                id: "slot-b",
                user_id: "friend-b",
                day_of_week: 2,
                start_time: "16:00:00",
                end_time: "20:00:00",
                status: "free",
              },
            ],
            error: null,
          },
        ],
      });

      const result = await getAcceptedFriendAvailability(client, "me");
      const profileQuery = states.find((state) => state.table === "profiles");
      const availabilityQuery = states.find(
        (state) => state.table === "availabilities",
      );

      expect(
        profileQuery?.operations.find((operation) => operation.method === "in")
          ?.args,
      ).toEqual(["id", ["friend-a", "friend-b"]]);
      expect(
        availabilityQuery?.operations.find(
          (operation) => operation.method === "in",
        )?.args,
      ).toEqual(["user_id", ["friend-a", "friend-b"]]);
      expect(result).toEqual([
        {
          profile: {
            id: "friend-b",
            username: "bravo",
            display_name: "Bravo",
            avatar_url: null,
          },
          slots: [
            {
              id: "slot-b",
              user_id: "friend-b",
              day_of_week: 2,
              start_time: "16:00",
              end_time: "20:00",
              status: "free",
            },
          ],
        },
        {
          profile: {
            id: "friend-a",
            username: "alpha",
            display_name: "Alpha",
            avatar_url: null,
          },
          slots: [
            {
              id: "slot-a",
              user_id: "friend-a",
              day_of_week: 1,
              start_time: "08:00",
              end_time: "12:00",
              status: "free",
            },
          ],
        },
      ]);
    });
  });

  describe("getFriendDetail", () => {
    it("returns null when no accepted friendship exists", async () => {
      const { client, states } = createSupabaseMock({
        friendships: [{ data: null, error: null }],
      });

      await expect(getFriendDetail(client, "me", "friend-a")).resolves.toBeNull();
      expect(states).toHaveLength(1);
      expect(states[0]?.table).toBe("friendships");
    });

    it("returns normalized friend data when an accepted friendship exists", async () => {
      const { client } = createSupabaseMock({
        friendships: [{ data: { id: "friendship-1" }, error: null }],
        profiles: [
          {
            data: {
              id: "friend-a",
              username: "alpha",
              display_name: "Alpha",
              avatar_url: null,
            },
            error: null,
          },
        ],
        availabilities: [
          {
            data: [
              {
                id: "slot-a",
                user_id: "friend-a",
                day_of_week: 1,
                start_time: "08:00:00",
                end_time: "12:00:00",
                status: "free",
              },
            ],
            error: null,
          },
        ],
      });

      await expect(getFriendDetail(client, "me", "friend-a")).resolves.toEqual({
        profile: {
          id: "friend-a",
          username: "alpha",
          display_name: "Alpha",
          avatar_url: null,
        },
        slots: [
          {
            id: "slot-a",
            user_id: "friend-a",
            day_of_week: 1,
            start_time: "08:00",
            end_time: "12:00",
            status: "free",
          },
        ],
      });
    });
  });
});
