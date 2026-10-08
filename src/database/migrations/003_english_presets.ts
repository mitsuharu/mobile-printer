import type { Migration } from './types'

// Only recognize the two bundled layouts by their original names and field sets.
// Each UPDATE matches an original default string, preserving customized values.
const commonKeys =
  "'name','alias','icon','description','twitter','facebook','github','website','qrUrl','qrDescription'"
const allKeys = `${commonKeys},'company','position','address'`
const presetIds = `SELECT l.id FROM layouts l WHERE
  (l.name = '名刺'
   AND (SELECT COUNT(*) FROM layout_fields f WHERE f.layout_id = l.id) = 13
   AND NOT EXISTS (SELECT 1 FROM layout_fields f WHERE f.layout_id = l.id AND f.key NOT IN (${allKeys})))
  OR
  (l.name = '名刺（シンプル）'
   AND (SELECT COUNT(*) FROM layout_fields f WHERE f.layout_id = l.id) = 10
   AND NOT EXISTS (SELECT 1 FROM layout_fields f WHERE f.layout_id = l.id AND f.key NOT IN (${commonKeys})))`

const labels = [
  ['name', '名前', 'Name'],
  ['alias', '別名、読み仮名など', 'Alias / pronunciation'],
  ['icon', 'アイコン画像', 'Profile image'],
  ['description', 'フリーテキスト', 'Description'],
  ['company', '会社名', 'Company'],
  ['position', '職種など', 'Job title'],
  ['address', 'アドレス', 'Address'],
  ['qrUrl', 'QRコードのURL', 'QR code URL'],
  ['qrDescription', 'QRコードの説明', 'QR code description'],
] as const

const sampleValues = [
  ['サンプル', 'name', '織田信長', 'Nobunaga Oda'],
  [
    'サンプル',
    'description',
    '人間五十年、下天の内をくらぶれば、夢幻の如くなり',
    'Fifty years of human life, compared with the lower heavens, are like a dream or an illusion.',
  ],
  ['サンプル', 'company', '株式会社 織田軍', 'Oda Army Co., Ltd.'],
  ['サンプル', 'position', '代表取締役大名', 'President and daimyo'],
  ['サンプル', 'address', '尾張国', 'Owari Province'],
  ['開発者紹介', 'name', '江本光晴', 'Mitsuharu Emoto'],
  [
    '開発者紹介',
    'description',
    'iOSアプリの開発が好き',
    'I enjoy developing iOS apps.',
  ],
] as const

// This migration is a fixed snapshot; it does not depend on future preset changes.
export const englishPresetsMigration: Migration = {
  version: 3,
  statements: [
    ...labels.map(
      ([key, original, english]) =>
        `UPDATE layout_fields SET label = '${english}'
       WHERE key = '${key}' AND label = '${original}' AND layout_id IN (${presetIds})`,
    ),
    ...sampleValues.map(
      ([title, key, original, english]) =>
        `UPDATE print_data_values SET text_value = '${english}'
       WHERE text_value = '${original}'
         AND print_data_id IN (SELECT id FROM print_data WHERE title = '${title}' AND layout_id IN (${presetIds}))
         AND field_id IN (SELECT id FROM layout_fields WHERE key = '${key}' AND layout_id IN (${presetIds}))`,
    ),
    `UPDATE print_data SET title = 'Sample' WHERE title = 'サンプル' AND layout_id IN (${presetIds})`,
    `UPDATE print_data SET title = 'Developer profile' WHERE title = '開発者紹介' AND layout_id IN (${presetIds})`,
    `UPDATE layouts SET name = 'Business card' WHERE name = '名刺' AND id IN (${presetIds})`,
    `UPDATE layouts SET name = 'Business card (simple)' WHERE name = '名刺（シンプル）' AND id IN (${presetIds})`,
  ],
}
