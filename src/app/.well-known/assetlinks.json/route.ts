import { NextResponse } from "next/server";

// Android fetches this from https://quickpic.click/.well-known/assetlinks.json
// to verify this domain is allowed to open in the app via App Links.
//
// TODO before this works: replace the package name once it's real (not
// the placeholder com.example.quick_pic - see android/app/build.gradle.kts),
// and fill in the real SHA256 certificate fingerprint(s). Get this by
// running, from the android/ folder:
//   ./gradlew signingReport
// which prints a SHA256 fingerprint for each variant (debug and release
// have DIFFERENT fingerprints - the release one is what matters for the
// actual published app, but add both if you want App Links to also work
// on a locally-built debug APK during testing).
const ANDROID_PACKAGE_NAME = "com.example.quick_pic"; // TODO: update once this is a real package name
const ANDROID_SHA256_FINGERPRINTS = [
  "TODO_PASTE_RELEASE_SHA256_FINGERPRINT_HERE",
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
