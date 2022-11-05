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

export const isEqualToSubmission = (a: Submission, b: Submission) =>
  a.uuid === b.uuid
