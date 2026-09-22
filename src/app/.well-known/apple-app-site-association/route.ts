import { NextResponse } from "next/server";

// Apple fetches this from https://quickpic.click/.well-known/apple-app-site-association
// (no file extension, must be valid JSON, must be served over HTTPS) to
// verify this domain is allowed to open in the app via Universal Links.
// Apple's CDN caches this aggressively - changes here can take a while to
// take effect, and there's no reliable way to force-invalidate their cache.
//
// TODO before this works: replace TEAMID with the real Apple Developer
// Team ID (Apple Developer portal > Membership, or Xcode > Signing &
// Capabilities > Team), and confirm the bundle ID below matches whatever
// the app's real PRODUCT_BUNDLE_IDENTIFIER ends up being (currently still
// the placeholder com.example.quickPic - needs to change to something
// real first, see ios/Runner.xcodeproj/project.pbxproj).
const APPLE_TEAM_ID = "TEAMID"; // TODO: fill in
const APPLE_BUNDLE_ID = "com.OptionalLabs.QuickPic";

export async function GET() {
  return NextResponse.json(
    {
      applinks: {
        details: [
          {
            appIDs: [`${APPLE_TEAM_ID}.${APPLE_BUNDLE_ID}`],
            components: [
              // Only the auth callback path opens directly in the app -
              // everything else on the domain stays a normal web link
              // (tapping a shared photographer profile link, for
              // example, should open in the browser, not force-launch
              // the app for someone who may not have it installed).
              { "/": "/auth/callback", comment: "Magic link opens directly in the app" },
            ],
          },
        ],
      },
    },
    { headers: { "Content-Type": "application/json" } },
  );
}
