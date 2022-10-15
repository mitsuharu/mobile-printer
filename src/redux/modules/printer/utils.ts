import { Image } from "react-native"

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
   * 職種など
   */
  position?: string

  /**
   * 会社名
   */
  company?: string

  
  /**
   * フリーテキストなど
   */
  description?: string

  icon?: Image


  sns?:{
    twitter?: string
    facebook?: string
    github?: string
  }

  qr?:{
    url?: string
    description?: string
  }
}


export const sampleProfile: Profile = {
  name: "織田信長",
  alias: "Nobinaga Oda",
  company: "尾張国",
  position: "大名",
  description: "人間五十年、下天の内をくらぶれば、夢幻の如くなり",
}
