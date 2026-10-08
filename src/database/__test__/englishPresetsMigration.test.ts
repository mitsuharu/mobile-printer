import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { migrate, readSchemaVersion } from '../migrate'
import { migrations } from '../migrations'
import { findAllLayouts, saveLayout } from '../repositories/layoutRepository'
import {
  findAllPrintData,
  savePrintData,
} from '../repositories/printDataRepository'
import { seedPresets } from '../seedPresets'
import { createTestConnection, type TestConnection } from './testConnection'

const oldLabels = [
  ['name', 'Name', '名前'],
  ['alias', 'Alias / pronunciation', '別名、読み仮名など'],
  ['icon', 'Profile image', 'アイコン画像'],
  ['description', 'Description', 'フリーテキスト'],
  ['company', 'Company', '会社名'],
  ['position', 'Job title', '職種など'],
  ['address', 'Address', 'アドレス'],
  ['qrUrl', 'QR code URL', 'QRコードのURL'],
  ['qrDescription', 'QR code description', 'QRコードの説明'],
] as const
const oldValues = [
  ['Sample', 'name', '織田信長'],
  ['Sample', 'description', '人間五十年、下天の内をくらぶれば、夢幻の如くなり'],
  ['Sample', 'company', '株式会社 織田軍'],
  ['Sample', 'position', '代表取締役大名'],
  ['Sample', 'address', '尾張国'],
  ['Developer profile', 'name', '江本光晴'],
  ['Developer profile', 'description', 'iOSアプリの開発が好き'],
] as const
let db: TestConnection

beforeEach(async () => {
  db = createTestConnection()
  await db.execute('PRAGMA foreign_keys = ON')
  await migrate(
    db,
    migrations.filter(({ version }) => version < 3),
  )
  await seedPresets(db)
})
afterEach(() => db.close())

const makeLegacyPresets = async () => {
  for (const [key, english, original] of oldLabels) {
    await db.execute(
      'UPDATE layout_fields SET label = ? WHERE key = ? AND label = ?',
      [original, key, english],
    )
  }
  for (const [title, key, original] of oldValues) {
    await db.execute(
      `UPDATE print_data_values SET text_value = ?
      WHERE print_data_id IN (SELECT id FROM print_data WHERE title = ?)
      AND field_id IN (SELECT id FROM layout_fields WHERE key = ?)`,
      [original, title, key],
    )
  }
  await db.execute(
    "UPDATE layouts SET name = '名刺' WHERE name = 'Business card'",
  )
  await db.execute(
    "UPDATE layouts SET name = '名刺（シンプル）' WHERE name = 'Business card (simple)'",
  )
  await db.execute(
    "UPDATE print_data SET title = 'サンプル' WHERE title = 'Sample'",
  )
  await db.execute(
    "UPDATE print_data SET title = '開発者紹介' WHERE title = 'Developer profile'",
  )
}

describe('English preset migration', () => {
  it('upgrades both saved presets to match fresh English presets without changing IDs, images or geometry', async () => {
    const layoutsBefore = await findAllLayouts(db)
    const recordsBefore = await findAllPrintData(db)
    const imagesBefore = await db.execute(
      'SELECT * FROM image_assets ORDER BY id',
    )
    await makeLegacyPresets()

    await migrate(db)

    expect(await readSchemaVersion(db)).toBe(3)
    expect(await findAllLayouts(db)).toEqual(layoutsBefore)
    expect(await findAllPrintData(db)).toEqual(recordsBefore)
    expect(await db.execute('SELECT * FROM image_assets ORDER BY id')).toEqual(
      imagesBefore,
    )
    expect((await db.execute('PRAGMA foreign_key_check')).rows).toEqual([])
  })

  it('preserves customized labels and contents, and leaves unrelated layouts with the same Japanese name alone', async () => {
    await makeLegacyPresets()
    await db.execute(
      "UPDATE layout_fields SET label = 'Full legal name' WHERE key = 'name'",
    )
    await db.execute(
      "UPDATE print_data_values SET text_value = 'My customer' WHERE field_id IN (SELECT id FROM layout_fields WHERE key = 'name')",
    )
    const [preset] = await findAllLayouts(db)
    const customLayout = await saveLayout(db, {
      ...preset,
      id: 'custom-card',
      name: '名刺',
      elements: [],
      fields: [
        { id: 'custom-name', key: 'name', label: '名前', valueType: 'text' },
      ],
    })
    const customRecord = await savePrintData(db, {
      id: 'custom-record',
      layoutId: customLayout.id,
      title: 'サンプル',
      values: { 'custom-name': { kind: 'text', value: '織田信長' } },
      createdAt: 1,
      updatedAt: 1,
    })

    await migrate(db)

    const layouts = await findAllLayouts(db)
    expect(layouts.find(({ id }) => id === customLayout.id)).toEqual(
      customLayout,
    )
    expect(
      (await findAllPrintData(db)).find(({ id }) => id === customRecord.id),
    ).toEqual(customRecord)
    for (const layout of layouts.filter(({ id }) => id !== customLayout.id)) {
      expect(layout.fields.find(({ key }) => key === 'name')?.label).toBe(
        'Full legal name',
      )
    }
    expect(
      (
        await db.execute(
          "SELECT text_value FROM print_data_values WHERE field_id IN (SELECT id FROM layout_fields WHERE key = 'name' AND layout_id != 'custom-card')",
        )
      ).rows,
    ).toEqual([{ text_value: 'My customer' }, { text_value: 'My customer' }])
  })
})
