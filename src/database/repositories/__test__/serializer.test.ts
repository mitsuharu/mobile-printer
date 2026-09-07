import { describe, expect, it } from '@jest/globals'
import { deserializeElement, serializeElement } from '../serializer'

describe('deserializeElement', () => {
  it('未知の要素種別は読み取らない', () => {
    expect(() =>
      deserializeElement({
        id: 'x',
        layout_id: 'layout-1',
        sort_order: 0,
        type: 'unknown',
        props: '{}',
        source: '{"kind":"none"}',
      }),
    ).toThrow('unknown layout element type: unknown')
  })

  it('参照先の画像が失われていても要素は残す', () => {
    const element = deserializeElement({
      id: 'image-1',
      layout_id: 'layout-1',
      sort_order: 0,
      type: 'image',
      props: JSON.stringify({
        width: 200,
        imageType: 'binary',
        alignment: 'center',
        hideWhenEmpty: true,
      }),
      source: JSON.stringify({ kind: 'staticImage', assetId: 'missing' }),
    })

    expect(element.type === 'image' && element.source).toEqual({
      kind: 'static',
      asset: undefined,
    })
  })
})

describe('serializeElement', () => {
  it('固定の画像は本体ではなく参照だけを持たせる', () => {
    const row = serializeElement(
      {
        id: 'image-1',
        type: 'image',
        source: {
          kind: 'static',
          asset: {
            id: 'asset-1',
            path: '/images/asset-1.png',
            width: 200,
            imageType: 'binary',
          },
        },
        width: 200,
        imageType: 'binary',
        alignment: 'center',
        hideWhenEmpty: true,
      },
      'layout-1',
      3,
    )

    expect(JSON.parse(row.source)).toEqual({
      kind: 'staticImage',
      assetId: 'asset-1',
    })
    expect(row.source).not.toContain('AAAA')
    expect(row.sort_order).toBe(3)
  })
})
