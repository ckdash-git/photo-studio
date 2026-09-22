import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateMyReferralCode, getReferralSettings, getMyReferralStats } from "@/lib/referrals";
import { ShareCard } from "./share-card";
import { PageGradientBg } from "@/app/page-gradient-bg";

export default async function InvitePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [code, settings, stats] = await Promise.all([
    getOrCreateMyReferralCode(),
    getReferralSettings(),
    getMyReferralStats(user.id),
  ]);

  if (!code) {
    return (
      <main className="flex-1 mx-auto max-w-md w-full px-6 py-24 text-center text-stone">
        Couldn&apos;t set up your referral link right now - try again in a moment.
      </main>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quickpic.click";
  const referralUrl = `${siteUrl}/r/${code}`;

  return (
    <main className="flex-1 relative overflow-hidden mx-auto max-w-md w-full px-6 py-16">
      <PageGradientBg />
      <h1 className="text-2xl font-semibold text-ink">Invite friends</h1>
      <p className="mt-2 text-slate">
        Share your link. Your friend gets {settings.welcome_percent_off}% off
        their first booking, and you get {settings.referrer_percent_off}% off
        once they complete it.
      </p>

      <ShareCard referralUrl={referralUrl} code={code} />

      <div className="mt-8 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-hairline p-4 text-center">
          <p className="text-2xl font-semibold text-ink">{stats.signups}</p>
          <p className="text-xs text-stone mt-1">Friends signed up</p>
        </div>
        <div className="rounded-lg border border-hairline p-4 text-center">
          <p className="text-2xl font-semibold text-ink">{stats.rewarded}</p>
          <p className="text-xs text-stone mt-1">Rewards earned</p>
        </div>
      </div>
    </main>
  );
}
