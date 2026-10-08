# English interface edition

This local fork is based on upstream tag 1.0.2, commit 19176c45b36b22c1636ca8a339dfa60b1a03c27d. The upstream README declares the MIT license.

Menus, accessibility labels, dialogs, error messages and the in-app guide are in English. The launcher label is Mobile Print. The two bundled layouts, their field labels, record titles and Japanese sample text are also translated. Application ID, version, dependencies, printer commands, layout geometry, images and links are preserved.

Data migration 3 updates the original Japanese defaults already saved by earlier versions. It recognizes the two bundled layouts by name and complete field-key sets, translates only unchanged default strings, and preserves customized labels and values. No tables, columns, IDs or image paths are changed.

See [the English user guide](docs/usage.md). Upstream attribution and links remain in the app and original README. This copy has not been published to GitHub.

## Build from source

Use Node 24, the committed Yarn 4.9.1, JDK 17 and the SDK/NDK versions in android/build.gradle.

```sh
node .yarn/releases/yarn-4.9.1.cjs install --immutable
yarn typecheck
yarn lint
TZ=Asia/Tokyo yarn test --runInBand
cd android
./gradlew assembleRelease
```

For the locally packaged English APK, the translated production JavaScript is bundled with Metro and compiled with the lockfile-pinned Hermes compiler. The original 1.0.2 APK supplies unchanged Android code, native libraries and resources; only its JavaScript asset and launcher-name string are replaced. The APK is aligned and signed with the upstream committed debug key, after matching its certificate to the original release. This packaging is not a full Gradle rebuild.

The original release APK remains available for rollback with adb install -r, without uninstalling the app.
