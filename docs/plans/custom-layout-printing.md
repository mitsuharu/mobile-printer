# 自由レイアウト印刷への改修計画

プロフィール印刷を「固定レイアウト＋固定フォーム」から「ユーザーが要素を組み立てる自由レイアウト」へ作り替えるための計画と進捗記録です。
作業は複数のPRに分割し、`gh stack` によるスタックPRで進めます。

## 背景と目的

現状（`main` 時点）は次の構成です。

- 印刷レイアウトは [printProfile.ts](../../src/redux/modules/printer/saga/printProfile.ts) の `print()` にハードコードされている。
- 入力項目は `Profile` 型（[types.ts](../../src/redux/modules/printer/utils/types.ts)）に固定され、[FormView](../../src/screens/Form/FormView/index.tsx) が各フィールドを個別に並べている。
- 保存は `redux-persist` + AsyncStorage による `Submission[]` の丸ごと保存。

これを次のように変更します。

- ユーザーがテキスト・画像などの**要素を追加・編集・並べ替え**してレイアウトを組める。
- レイアウトは保存・複製・変更できる。
- レイアウトとは別に、**印刷データ**（レイアウトへ差し込む値）を管理できる。
- 保存先を SQLite へ移す。

## 決定事項

| 項目 | 決定 | 理由 |
| --- | --- | --- |
| データモデル | **テンプレート分離型** | レイアウト（体裁）と印刷データ（値）を分ける。1レイアウトに複数の印刷データを紐付けられ、レイアウト修正が全データへ反映される。現行の「同じ名刺体裁で人物違い」を自然に一般化できる。 |
| 永続化 | **SQLite（`@op-engineering/op-sqlite`）** | New Architecture / TurboModule 対応、同期API・トランザクションあり、現在活発にメンテされている。 |
| 並べ替えUI | **`react-native-reanimated` + `react-native-gesture-handler` + `react-native-reorderable-list`** | ドラッグでの並べ替えを本来の操作感で実装する。 |
| 既存データ | **マイグレーション不要** | 依頼により、既存の `Submission` は引き継がない。 |
| ランダム印刷 | **廃止** | 依頼による。 |
| サンプル印刷データ | **新レイアウトで作り直す** | 依頼による。 |

### 依存関係のバージョン確認結果（2026-09-07 時点）

| パッケージ | 最新 | 備考 |
| --- | --- | --- |
| `@op-engineering/op-sqlite` | 18.1.4 | |
| `react-native-reanimated` | 4.6.0 | peer: `react-native@0.83 - 0.87`（本アプリは 0.87.1）、`react-native-worklets@0.12.x` |
| `react-native-worklets` | 0.12.1 | peer: `react-native@0.83 - 0.87` |
| `react-native-gesture-handler` | 3.2.1 | |
| `react-native-reorderable-list` | 0.18.1 | peer: RNGH `>=2.12.0`、Reanimated `>=3.12.0` |

`android/gradle.properties` で `newArchEnabled=true`、`minSdkVersion = 24` を確認済みです。Reanimated 4 は New Architecture 前提のため要件を満たします。

## ドメインモデル

### 要素（Element）

現行のプロフィール印刷が出力しているものを、そのまま要素として一般化します。

| 種別 | 対応する現行処理 | 主なプロパティ |
| --- | --- | --- |
| `text` | `printText` | 文字列、フォントサイズ、太字、下線、寄せ |
| `image` | `printImage` | Base64、幅、`binary` / `grayscale`、寄せ |
| `qrcode` | `printQRCode` | 文字列、モジュールサイズ、誤り訂正レベル、寄せ |
| `columns` | `printColumnsString`（SNS行） | セル配列、各列幅、各列の寄せ |
| `divider` | `hr()` | `line` / `double` / `dots` / `wave` / `plus` / `star` |
| `spacer` | `lineWrap` | 行数 |
| `timestamp` | 末尾の印刷時刻 | フォーマット、寄せ |

各要素は内容の供給元を持ちます。

- `{ kind: 'static', value }` … レイアウトに直接埋め込む固定値
- `{ kind: 'field', fieldId }` … 印刷データから差し込む

また、現行の `if (alias)` 相当として `hideWhenEmpty`（既定 `true`）を持ち、値が空の要素は印刷時に読み飛ばします。

### フィールド（Field）とレイアウト

- `Layout` … `id` / `name` / 要素の並び / フィールド定義 / `createdAt` / `updatedAt`
- `LayoutField` … `id` / `key` / `label` / `valueType`（`text` | `multilineText` | `url` | `image`）/ 並び順
- `PrintData` … `id` / `layoutId` / `title` / フィールドIDごとの値 / `createdAt` / `updatedAt`

## SQLite スキーマ（初版）

`PRAGMA user_version` でスキーマバージョンを管理し、`src/database/migrations/` に連番で追加します。

```sql
CREATE TABLE layouts (
  id          TEXT PRIMARY KEY,
  name        TEXT    NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE TABLE layout_fields (
  id          TEXT PRIMARY KEY,
  layout_id   TEXT    NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
  key         TEXT    NOT NULL,
  label       TEXT    NOT NULL,
  value_type  TEXT    NOT NULL,
  sort_order  INTEGER NOT NULL,
  UNIQUE (layout_id, key)
);

CREATE TABLE layout_elements (
  id          TEXT PRIMARY KEY,
  layout_id   TEXT    NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
  sort_order  INTEGER NOT NULL,
  type        TEXT    NOT NULL,
  props       TEXT    NOT NULL,  -- JSON
  source      TEXT    NOT NULL   -- JSON
);
CREATE INDEX idx_layout_elements_layout ON layout_elements(layout_id, sort_order);

CREATE TABLE print_data (
  id          TEXT PRIMARY KEY,
  layout_id   TEXT    NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE TABLE print_data_values (
  print_data_id TEXT NOT NULL REFERENCES print_data(id) ON DELETE CASCADE,
  field_id      TEXT NOT NULL REFERENCES layout_fields(id) ON DELETE CASCADE,
  text_value    TEXT,
  asset_id      TEXT REFERENCES image_assets(id) ON DELETE SET NULL,
  PRIMARY KEY (print_data_id, field_id)
);

CREATE TABLE image_assets (
  id          TEXT PRIMARY KEY,
  base64      TEXT    NOT NULL,
  width       INTEGER NOT NULL,
  image_type  TEXT    NOT NULL,  -- binary | grayscale
  created_at  INTEGER NOT NULL
);
```

画像の Base64 は一覧表示のたびに読み込まないよう `image_assets` に分離します。

## 構成

```
src/database/
  index.ts                 // 接続の生成と初期化
  migrations/              // PRAGMA user_version 管理のマイグレーション
  repositories/
    layoutRepository.ts
    printDataRepository.ts
    imageAssetRepository.ts
src/redux/modules/layout/  // レイアウトと印刷データの slice / saga / selectors
src/print/
  types.ts                 // Element / Layout / PrintData の型
  buildPrintCommands.ts    // (layout, printData) -> PrintCommand[]（純粋関数）
  executePrintCommands.ts  // PrintCommand[] -> SunmiPrinterLibrary 呼び出し
src/screens/
  LayoutList/  LayoutEditor/  ElementEditor/  PrintDataList/  PrintDataForm/  PrintPreview/
```

SQLite を唯一の情報源とし、Redux は画面へ供給するキャッシュとして扱います（この slice は `redux-persist` の対象にしません）。
印刷は `buildPrintCommands` という純粋関数を挟むことで、実機なしでも Jest で検証できるようにします。

## PR 分割

`gh stack` でスタックPRとして積み上げます。ブランチは `codex/` プレフィックスを維持します。

| # | ブランチ | 内容 | 主な検証 |
| --- | --- | --- | --- |
| 1 | `codex/layout-plan` | 本計画書と AGENTS.md への追記 | `yarn lint` |
| 2 | `codex/layout-sqlite-setup` | `op-sqlite` 導入、DB接続、マイグレーション、リポジトリ層の骨組み | typecheck / lint / test / Android ビルド / 実機起動 |
| 3 | `codex/layout-domain-model` | 要素・レイアウト・印刷データの型、`buildPrintCommands` と単体テスト（既存の印刷経路は据え置き） | typecheck / lint / test |
| 4 | `codex/layout-repository` | レイアウトのCRUD（リポジトリ + slice + saga + テスト、UIなし） | typecheck / lint / test |
| 5 | `codex/layout-list-screen` | レイアウト一覧・新規作成・複製・削除のUI | typecheck / lint / test |
| 6 | `codex/layout-element-editor` | 要素の追加・個別編集UI、ドラッグ並べ替え（Reanimated / RNGH 導入） | typecheck / lint / test / Android ビルド / 実機操作 |
| 7 | `codex/layout-print-data` | 印刷データのCRUDと、フィールド定義から生成する動的フォーム | typecheck / lint / test |
| 8 | `codex/layout-print-execution` | 新レンダラでの実印刷とプレビュー画面 | typecheck / lint / test / 実機印刷 |
| 9 | `codex/layout-remove-profile` | 旧プロフィール印刷（`Profile` / `Submission` / `printProfile` / Formスクリーン）とランダム印刷の撤去、サンプルデータの新レイアウト移植 | typecheck / lint / test / 実機印刷 |
| 10 | `codex/layout-docs` | README とドキュメントの更新 | lint |

各PRは AGENTS.md の運用ルールに従い、Conventional Commits・検証結果の記載・実機確認事項の明記を行います。

## 進捗

- [ ] PR1 計画の記録
- [ ] PR2 SQLite 基盤
- [ ] PR3 ドメインモデルと印刷レンダラ
- [ ] PR4 レイアウトのCRUD
- [ ] PR5 レイアウト一覧UI
- [ ] PR6 要素編集とドラッグ並べ替え
- [ ] PR7 印刷データとフォーム
- [ ] PR8 印刷実行とプレビュー
- [ ] PR9 旧プロフィール印刷の撤去
- [ ] PR10 ドキュメント更新

## 未確定・要検討

- SUNMI 実機（Android 7 系）での Reanimated 4 / op-sqlite の動作は、PR2 と PR6 の実機確認で必ず検証する。問題が出た場合は並べ替えを上下ボタン方式へ、SQLite を別ライブラリへ切り替える判断を行う。
- プレビューは印刷幅 384px（58mm）を前提とする。80mm 端末の扱いは PR8 で `PrinterInfo.pixelWidth` を参照して決める。
- 画像要素の元データ管理（未参照アセットの掃除）は PR7 以降で検討する。
