# AGENTS.md

このファイルは、このリポジトリで作業するコーディングエージェント向けのルールを定義します。
[プリンターライブラリの開発ルール](https://github.com/mitsuharu/react-native-sunmi-printer-library/blob/main/AGENTS.md) を基に、このアプリの構成に合わせています。

## リポジトリ構成

- このリポジトリは、`@mitsuharu/react-native-sunmi-printer-library` を利用してSUNMI端末で印刷するReact Nativeアプリです。npmへ公開するライブラリではありません。
- `src/screens/` は画面、`src/components/` は共通UI、`src/redux/` は状態管理とSaga、`src/utils/` はユーティリティとテストです。
- `android/` はAndroidネイティブプロジェクト、`jest/` はテストのセットアップです。
- `ios/` は存在しますが、プリンターライブラリはAndroid専用です。明示的な依頼なしにiOSでの印刷対応を追加したり、対応済みと記載したりしません。
- ライブラリ側の `example/`、`example-expo/` や公開処理を、このアプリにそのまま導入しません。

## 開発環境

- `.node-version` に記載されたNode.jsを使用します。
- `.yarn/releases/` にコミットされたYarnを使用し、依存関係のインストールにnpmを使用しません。
- ルートで `corepack enable`、続けて `yarn install --immutable` を実行します。
- Node.js製の開発CLIはグローバルインストールや `npx` で取得せず、ルートの `devDependencies` にバージョンを固定して `yarn <command>` で実行します。既存の `clean:project` は `npx` を使用しているため、依存関係を整備するまでは実行しません。
- JavaScript・TypeScript・JSONなど、Biomeが対応するファイルの検査と整形にはBiomeを使用します。確認は `yarn lint`、自動修正と整形は `yarn lint-force` で実行します。
- Android開発にはJDK 17と、`android/build.gradle` に定義されたAndroid SDK・NDKを使用します。
- Gradleはリポジトリの `android/gradlew` を使用します。

## 必須の検証

変更内容に応じて必要な検証を選び、PR作成前に該当するコマンドを実行します。

```sh
yarn typecheck
yarn lint
TZ=Asia/Tokyo yarn test --runInBand
(cd android && ./gradlew assembleDebug)
```

- JavaScript・TypeScriptの振る舞いを変更するときは、可能な限りJestテストを追加または更新します。
- 依存関係やネイティブ実装、印刷動作を変更するときはAndroidビルドも実行します。
- CIではtypecheck・lint・テストを実行します。それでも実機での確認は代替できないため、未実施事項は報告します。
- ドキュメントのみの変更では差分とリンクを、ワークフローの変更ではYAML構文・トリガー・権限・実行コマンドを確認します。
- ビルド成功で確認できるのはコンパイルとリンクまでです。印刷・NFCなどのハードウェア依存機能は対応するSUNMI実機で操作結果を確認し、実施内容と結果、または確認できなかった事項をPRへ記載します。

## React Native・依存関係の更新

- 現在のバージョンはルートの `package.json` から取得します。
- React Native更新前に、利用可能な `upgrading-react-native` スキルを読み、Upgrade Helperと `react-native-community/rn-diff-purge` の正規テンプレート差分を基準にします。
- 更新先はnpmの公開情報とrn-diff-purgeの `RELEASES` で存在を確認し、近いパッチバージョンを推測で代用しません。
- React、React Native、React Test Renderer、型定義、Babel・Metro・TypeScript設定、Community CLIは対象テンプレートに対応する互換セットとして更新します。
- AndroidのSDK、Kotlin、Gradle Wrapper（JARとスクリプトを含む）、Application、Manifest、Gradle propertiesを確認します。
- アプリID、SUNMIサービスの設定、対応ABI、印刷・NFC機能、Reduxの保存データ、アプリ固有のBabel・Metro設定を保持し、テンプレートのサンプルで上書きしません。
- プリンターライブラリの更新では公開API・対応端末・Android要件を確認し、呼び出し側とテストを合わせます。
- 依存関係の編集をまとめてからYarnでインストールして `yarn.lock` を更新します。npmやパッケージ単位の追加インストールを繰り返しません。
- 更新後は上記の検証と、接続可能なSUNMI実機でのインストール・起動・該当機能の確認を行います。

## レイアウト印刷

- 印刷する内容は、体裁を定める **レイアウト** と、その入力項目へ入れる **印刷データ** に分けて SQLite へ保存します。設計と実装の経緯は [`docs/plans/custom-layout-printing.md`](./docs/plans/custom-layout-printing.md) にまとまっています。
- レイアウトの解釈は `src/print/buildPrintCommands.ts` が `PrintCommand[]` を組み立て、`src/print/executePrintCommands.ts` がプリンターへ送ります。印刷の見た目を変えるときは、この純粋関数のテストを更新します。プレビューも同じ `PrintCommand[]` を描き直すため、印刷とプレビューで解釈が分かれません。
- スキーマを変更するときは `src/database/migrations/` に新しい版を追加します。一度入れたマイグレーションの内容は書き換えません。
- リポジトリ層のテストは Node 同梱の `node:sqlite` に対して実際のスキーマで実行します（`src/database/__test__/testConnection.ts`）。SQLや外部キーの挙動もここで検証できます。
- 操作や選択肢をユーザーに選ばせるAlert・ダイアログには、**選択肢の数にかかわらず必ずキャンセル（そのダイアログを閉じる手段）を用意します。** AndroidのAlertは戻るボタンでも画面外タップでも閉じられないため、キャンセルがないと、どれかを選ぶまで利用者が抜け出せません。
- AndroidのAlertは3つまでしかボタンを表示できません。キャンセルを含めて4つ以上になるものは `ListPickerModal` を使います。このモーダルはキャンセルを常に表示し、戻るボタンでも閉じられます。
- 選択肢がAlertに収まらないほど増えたときは、モーダルへ移す前に画面設計そのものを疑います。ダイアログを重ねて選ばせ続ける形は、一覧画面やセルの操作へ逃がせる場合が多く、増え続ける選択肢はUI/UXの問題を示す兆候です。**まず画面で表現できないかを検討してから、ダイアログを選びます。**
- AndroidのModalは別ウィンドウのため、開いた時点で中の `TextInput` へOSがフォーカスを当てます。React Nativeは、すでにフォーカスを持っている入力欄への `focus()` をJS側で捨てる（`TextInputState.focusTextInput`）ため、ネイティブへ命令が届かず、キーボードを出す要求も送られません。`src/components/Dialog/` は一度 `blur()` で手放してから当て直しています。当て直しさえすれば、ネイティブ側（`ReactEditText.requestFocusProgrammatically`）が自分で `showSoftInput` を呼ぶので、キーボードは自動で開きます。
- 大きな改修をPRへ分割するときは `gh stack`（`gh extension install github/gh-stack`）でスタックPRとして積み上げます。

## アプリ情報とOSSライセンス表示

- ホームのナビゲーションバー右上の (i) から「このアプリについて」（`src/screens/AppInfo/`）を開きます。アプリ名とバージョンは `react-native-device-info` から取得するため、表示を変えるのではなく `android/app/build.gradle` の `versionName`・`versionCode` を直します。
- ライセンス一覧は `src/screens/Licenses/`、本文は `src/screens/LicenseDetail/` が表示します。一覧の元データは `src/assets/licenses.json` で、`scripts/generateLicenses.mjs` が生成してコミットします。**手で編集しません。**
- 生成対象は `package.json` の `dependencies` から辿った実行時の依存のみで、`devDependencies` は含めません。アプリに同梱しないものを並べると、利用者に誤った情報を見せることになります。
- 依存パッケージを足す・外す・更新したときの手順です。

```sh
yarn install
yarn licenses:generate
git add src/assets/licenses.json
```

- `yarn licenses:generate` は、ライセンス本文を同梱していないパッケージと、`node_modules` に見つからないパッケージを標準出力へ並べます。本文がないものは詳細画面でホームページを案内するため、そのままで構いません。
- 作り直し忘れは2か所で検出します。CIの `Check OSS licenses` が生成し直して差分が出ると失敗し、`src/licenses/__test__/licenses.test.ts` が `dependencies` の取りこぼしとライセンス名の欠落を検出します。
- `src/assets/licenses.json` は生成物のため、Biomeの対象から外しています（`biome.json` の `files.includes`）。
- アプリ内の「使い方」は `src/screens/Guide/sections.ts` の文言だけで作っています。同じ内容を画像つきで [`docs/usage.md`](./docs/usage.md) にも置いているため、画面の操作を変えたら両方を直します。片方だけ古くなると利用者が迷います。

## アプリアイコン

- 元画像は [`docs/images/app-icon-source.png`](./docs/images/app-icon-source.png)（1254×1254）です。差し替えるときはこれを置き換えてから、各解像度を作り直します。
- 生成物は `android/app/src/main/res/mipmap-*/`（通常・丸）と `mipmap-*-v26/ic_foreground.png`（アダプティブの前景）です。背景は `values/colors-icon.xml` の `iconBackground`（現在は白）を使います。
- 大きさは用途ごとに変えています。**同じ画像をそのまま入れると、丸くくり抜く端末で絵柄が欠けます。**

| 用途 | 絵柄の占有率 | 理由 |
| --- | --- | --- |
| `ic_launcher.png` | 約85% | 四角のまま表示されるため、余白は控えめにする |
| `ic_launcher_round.png` | 約70% | 円で切り抜かれるため、四隅が落ちても欠けない大きさにする |
| `ic_foreground.png` | 約53% | 見える領域の8割に収め、絵柄の周りに余白を残す |

- 生成には macOS 同梱の `sips` を使います（`ImageMagick` は不要）。前景は 108/72 倍の解像度（mdpi 108px 〜 xxxhdpi 432px）で作ります。
- 前景を安全領域いっぱい（約65%）にすると、角丸マスクでは絵柄が縁に触れて窮屈に見え、円マスクでは左右が2割ほど欠けます。余白を残す方を採っています。
- 作り直したら実機のランチャーで見た目を確認します。Android 7 以前は通常アイコン、Android 8 以降はアダプティブアイコンが使われるため、**両方の世代で確認できると確実です。**

## 画像選択の互換性

- Android 7〜12では、`react-native-image-picker` のPhoto PickerがGoogle Play servicesへ委譲され、SUNMI端末で選択画面を表示せずキャンセルされる場合があります。現在は `patches/react-native-image-picker+8.2.1.patch` により、これらのOSでシステムのDocuments UIを使用します。
- 将来 `expo-image-picker` へ移行する場合、アプリ全体をExpo Managedへ移行する必要はありません。既存のBare React NativeへExpo Modulesを導入し、対象React Nativeバージョンとの正式な互換性を確認します。
- SUNMIなどの旧Android端末では、`expo-image-picker` のAndroid用 `legacy: true` を候補とし、Android 7の実機で画像一覧の表示、選択結果の取得、白黒変換、印刷まで確認します。
- 実機確認が完了してから `react-native-image-picker` とそのpatchを削除します。`patch-package` がほかに使われていない場合に限り、依存関係と `postinstall` からも削除します。

## 変更時のルール

- PRは1つの目的に絞り、無関係な整理や修正を含めません。
- 明示的に依頼されない限り、既存の印刷動作と保存データの互換性を維持します。
- タスクに必要でない限り、生成物、ロックファイル、リリース設定、ワークフローを変更しません。ビルド生成物はコミットしません。
- GitHub Actionsの依存先は完全なコミットSHAに固定し、横にバージョンコメントを残します。
- Safe ChainのバージョンとインストーラーのSHA-256を固定し、ハッシュ検証後に実行します。更新時は両方を確認し、検証を無効化しません。
- 認証情報、署名鍵、端末識別子、`local.properties` などのローカル設定をコミットしません。

## GitとPR・リリース

- 統合ブランチとPRのデフォルトのベースは `main` です。明示的な依頼なしにデフォルトブランチやリリースフローを変更しません。
- 変更は `main` に直接コミットせず、別の作業ブランチ（原則 `codex/` プレフィックス）で行い、PRを通じて追加・反映します。
- コミットメッセージは `feat:`、`fix:`、`test:`、`docs:`、`refactor:`、`chore:` などのConventional Commits形式を使用します。
- コミット粒度は責務の観点で決め、機能や目的ごとに分けます。1コミットは1つのまとまった責務を担うレビュー可能な粒度とし、独立した機能・目的や無関係な変更を混在させません。
- PR本文には変更概要、検証コマンドと結果、未実施の端末テストを記載します。
- 画面の見た目や操作を変えたときは、実機で撮った対応前後のスクリーンショットをPRへ添付します。文章だけでは、意図した見た目になっているかをレビューで判断できません。
- 添付には `gh` の `--attach` を使います（`gh` 2.99.0 以降）。`#` の後ろが代替テキストになり、本文の `![alt](./after.png)` は自動でアップロード先へ書き換わります。

```sh
gh pr create --attach './before.png#変更前' --attach './after.png#変更後'
gh pr comment <番号> --attach './after.png#変更後'
```

- 対応前の画面は、変更前のコミット（多くは `main`）をビルドして実機で撮ります。撮り忘れると後から用意できません。
- 撮影したファイルはリポジトリにコミットせず、作業用の一時ディレクトリへ置きます。
- 作業ツリーに既に存在する無関係な変更を書き換えたり、破棄したり、コミットへ含めたりしません。
- リリースとバージョン管理はメンテナーが行います。明示的な依頼なしにアプリのバージョン更新、タグ作成、配布、`.github/workflows/publish.yml` の変更を行いません。
- リリースは `.github/workflows/publish.yml` で行います。タグを push すると GitHub Releases と DeployGate へ配布し、`workflow_dispatch` でも実行できます。
- タグ名に `-` を含めると（`v1.2.0-beta.1` など）プレリリースとして公開します。含めなければ通常のリリースです。`workflow_dispatch` では入力で選びます。
- 製品版ではないため、リリースビルドもコミット済みの `android/app/debug.keystore` で署名します。ストア配布用の鍵は用意していません。
