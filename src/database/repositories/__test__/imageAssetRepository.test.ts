import { beforeEach, describe, expect, it } from '@jest/globals'
import type { ImageAsset, Layout } from '@/print'
import {
  createMigratedTestConnection,
  type TestConnection,
} from '../../__test__/testConnection'
import {
  deleteUnreferencedImageAssets,
  findImageAssets,
} from '../imageAssetRepository'
import { collectLayoutAssetIds, saveLayout } from '../layoutRepository'

const asset = (id: string): ImageAsset => ({
  id,
  path: `/images/${id}.png`,
  width: 200,
  imageType: 'binary',
})

const layoutWithAsset = (id: string, value: ImageAsset): Layout => ({
  id,
  name: id,
  fields: [],
  elements: [
    {
      id: `${id}-image`,
      type: 'image',
      source: { kind: 'static', asset: value },
      width: 200,
      imageType: 'binary',
      alignment: 'center',
      hideWhenEmpty: true,
    },
  ],
  createdAt: 0,
  updatedAt: 0,
})

let db: TestConnection

beforeEach(async () => {
  db = await createMigratedTestConnection()
})

describe('findImageAssets', () => {
  it('IDを指定しなければ問い合わせない', async () => {
    const before = db.executed.length
    await expect(findImageAssets(db, [])).resolves.toEqual([])
    expect(db.executed).toHaveLength(before)
  })

  it('指定したIDの画像だけを返す', async () => {
    await saveLayout(db, layoutWithAsset('a', asset('asset-1')))
    await saveLayout(db, layoutWithAsset('b', asset('asset-2')))

    await expect(findImageAssets(db, ['asset-2'])).resolves.toEqual([
      asset('asset-2'),
    ])
  })

  it('存在しないIDは結果に含めない', async () => {
    await expect(findImageAssets(db, ['missing'])).resolves.toEqual([])
  })
})

describe('saveImageAsset', () => {
  it('同じIDで保存し直すと上書きする', async () => {
    await saveLayout(db, layoutWithAsset('a', asset('asset-1')))
    await saveLayout(db, {
      ...layoutWithAsset('a', {
        ...asset('asset-1'),
        path: '/images/updated.png',
      }),
    })

    const [saved] = await findImageAssets(db, ['asset-1'])
    expect(saved.path).toBe('/images/updated.png')

    const all = await db.execute('SELECT * FROM image_assets')
    expect(all.rows).toHaveLength(1)
  })
})

describe('deleteUnreferencedImageAssets', () => {
  it('レイアウトから参照されている画像は残す', async () => {
    const layout = layoutWithAsset('a', asset('asset-1'))
    await saveLayout(db, layout)

    const removed = await deleteUnreferencedImageAssets(
      db,
      collectLayoutAssetIds([layout]),
    )

    expect(removed).toBe(0)
    await expect(findImageAssets(db, ['asset-1'])).resolves.toHaveLength(1)
  })

  it('どこからも参照されていない画像を消す', async () => {
    const layout = layoutWithAsset('a', asset('asset-1'))
    await saveLayout(db, layout)
    await saveLayout(db, { ...layout, elements: [] })

    const removed = await deleteUnreferencedImageAssets(db, [])

    expect(removed).toBe(1)
    await expect(findImageAssets(db, ['asset-1'])).resolves.toEqual([])
  })
})
