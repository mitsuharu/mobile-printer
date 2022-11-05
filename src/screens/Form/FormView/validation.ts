import { FieldError } from 'react-hook-form'

export const getValidationMessage = ({ type, message }: FieldError) => {
  try {
    console.log(type, message)
    switch (type) {
      case 'empty':
      case 'required':
        return 'この項目は必ず入力してください'
      default:
        return message ?? '入力に誤りがあります'
    }
  } catch (error) {
    console.warn(`getValidationMessage: ${error}`)
    return null
  }
}

export const isValidIfEmpty = (test: string) => !!test
