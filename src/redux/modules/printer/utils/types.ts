export type Profile = {
  /**
   * 名前
   */
  name: string

  /**
   * 別名や通称など
   */
  alias?: string

  /**
   * 肩書き
   */
  title?: {
    /**
     * 職種など
     */
    position?: string

    /**
     * 会社名
     */
    company?: string

    /**
     * アドレス（メールアドレス含む）
     */
    address?: string
  }

  /**
   * フリーテキストなど
   */
  description?: string

  /**
   * Base 64 でエンコードしたアイコン画像
   */
  iconBase64?: string

  sns?: {
    twitter?: string
    facebook?: string
    github?: string
    website?: string
  }

  qr?: {
    url: string
    description?: string
  }
}

/**
 * State に保存する印刷データ
 */
export type Submission = {
  title: string
  profile: Profile
  updatedAt: number
  createdAt: number
  uuid: string
}

/**
 * テキスト印刷のデータ
 */
export type TextSource = {
  text: string
  size: 'default' | 'large'
}

/**
 * 画像印刷のデータ
 */
export type ImageSource = {
  base64: string
  type: PrintImageType
  width: number
}

export type PrintImageType = 'monochrome' | 'grayscale'

/**
 * QRコード印刷のデータ
 */
export type QRCodeSource = {
  text: string
}
