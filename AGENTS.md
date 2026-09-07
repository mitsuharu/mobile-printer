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
- 現在のCIではtypecheckが無効です。CI成功だけで型検査が通ったと判断せず、失敗や未実施事項を報告します。
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

## 進行中の大規模改修

- プロフィール印刷を自由レイアウト印刷へ作り替える改修が進行中です。設計・PR分割・進捗は [`docs/plans/custom-layout-printing.md`](./docs/plans/custom-layout-printing.md) に記録します。
- この改修に着手するときは、まず同ファイルの「進捗」を読み、完了したPRにチェックを入れながら進めます。決定事項を変更したときも同ファイルへ反映します。
- 分割したPRは `gh stack`（`gh extension install github/gh-stack`）でスタックPRとして積み上げます。

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
- 作業ツリーに既に存在する無関係な変更を書き換えたり、破棄したり、コミットへ含めたりしません。
- リリースとバージョン管理はメンテナーが行います。明示的な依頼なしにアプリのバージョン更新、タグ作成、配布、`.github/workflows/publish.yml` の変更を行いません。
