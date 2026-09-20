import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SettingsForm } from "./settings-form";

export default async function AdminReferralsPage() {
  await requireAdmin();
  const db = createAdminClient();

  const [{ data: settings }, { count: totalSignups }, { count: totalRewarded }] = await Promise.all([
    db.from("referral_settings").select("welcome_percent_off, referrer_percent_off").eq("id", "default").single(),
    db.from("referral_signups").select("*", { count: "exact", head: true }),
    db.from("referral_signups").select("*", { count: "exact", head: true }).not("reward_issued_at", "is", null),
  ]);

  return (
    <main className="flex-1 mx-auto max-w-xl w-full px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Referral program</h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-hairline p-4">
          <p className="text-2xl font-semibold text-ink">{totalSignups ?? 0}</p>
          <p className="text-xs text-stone mt-1">Total referral signups</p>
        </div>
        <div className="rounded-lg border border-hairline p-4">
          <p className="text-2xl font-semibold text-ink">{totalRewarded ?? 0}</p>
          <p className="text-xs text-stone mt-1">Rewards issued (converted)</p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-hairline p-5">
        <h2 className="text-sm font-semibold text-ink">Reward settings</h2>
        <p className="mt-1 text-xs text-stone">
          The referrer&apos;s reward is only issued once their friend completes a real, paid
          booking - not on signup alone.
        </p>
        <SettingsForm
          welcomePercentOff={settings?.welcome_percent_off ?? 10}
          referrerPercentOff={settings?.referrer_percent_off ?? 10}
        />
      </div>
    </main>
  );
}
