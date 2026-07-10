const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export const MISSING_SUPABASE_ENV_MESSAGE =
  "Authentication is unavailable until NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are configured.";

type DatabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
};

export function normalizeUsername(value: string): string {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

export function validateUsername(value: string): string | null {
  const normalized = normalizeUsername(value);

  if (!normalized) {
    return "Username is required.";
  }

  if (!USERNAME_REGEX.test(normalized)) {
    return "Use 3-20 lowercase letters, numbers, or underscores.";
  }

  return null;
}

export function isUsernameTakenError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const databaseError = error as DatabaseErrorLike;
  const combinedMessage = [
    databaseError.message,
    databaseError.details,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    databaseError.code === "23505" &&
      (combinedMessage.includes("username") ||
        combinedMessage.includes("profiles_username_key")) ||
    combinedMessage.includes("username taken")
  );
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}
