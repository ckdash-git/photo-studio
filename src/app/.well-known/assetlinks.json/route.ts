import { NextResponse } from "next/server";

// Android fetches this from https://quickpic.click/.well-known/assetlinks.json
// to verify this domain is allowed to open in the app via App Links.
//
// This is the debug keystore's fingerprint. It currently covers both
// debug AND release builds of this app, since build.gradle.kts signs
// release with the debug keystore too ("signing with debug keys for now"
// - no real release signing config exists yet). Once real release
// signing is set up before an actual Play Store submission, re-run
// `./gradlew signingReport` from android/ and add that distinct release
// fingerprint to this array alongside this one (both can coexist here).
const ANDROID_PACKAGE_NAME = "com.optionallabs.quickpic";
const ANDROID_SHA256_FINGERPRINTS = [
  "23:42:3B:7A:D7:E8:C4:84:06:90:1D:4B:8A:72:4B:F6:DA:04:21:30:9A:CC:F5:80:4D:5E:6D:01:E4:05:AF:D7",
];

export async function GET() {
  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: ANDROID_PACKAGE_NAME,
          sha256_cert_fingerprints: ANDROID_SHA256_FINGERPRINTS,
        },
      },
    ],
    { headers: { "Content-Type": "application/json" } },
  );
}
