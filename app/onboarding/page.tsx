import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    redirect("/friends");
  }

  const displayName =
    typeof user.user_metadata.display_name === "string"
      ? user.user_metadata.display_name
      : typeof user.user_metadata.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user.email === "string"
          ? user.email.split("@")[0]
          : "Friend";

  return (
    <OnboardingForm userId={user.id} initialDisplayName={displayName} />
  );
}
