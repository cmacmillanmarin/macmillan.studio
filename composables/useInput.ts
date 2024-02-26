import type { InputType } from '~/types/front'
import { toUSD, toPercentage } from '~/utils'

export default function useInput() {
  const errorLabel = ref<string>('')

  function isValid(params: {
    required: boolean
    value: string | number
    type: InputType
    max?: number
    min?: number
    customErrorLabel?: string
  }): boolean {
    const { required, value, type, min, max, customErrorLabel } = params

    if (required && value === '') {
      errorLabel.value = 'Required field'
      return false
    }
    if (type === 'email') {
      errorLabel.value = customErrorLabel || 'Please enter a valid email address'
      if (value !== '') return validateEmail(value.toString())
    }
    if (type === 'phone') {
      errorLabel.value = customErrorLabel || 'Please enter a valid phone number'
      if (value !== '') return validatePhoneNumber(value.toString())
    }
    if (type === 'zip') {
      errorLabel.value = customErrorLabel || 'Invalid code'
      if (value !== '') return validateZipCode(value.toString())
    }
    if (type === 'number' || type === 'currency' || type === 'percentage') {
      if (min && parseFloat(value.toString()) < min) {
        let value: string | number = min
        if (type === 'percentage') value = toPercentage(value)
        else if (type === 'currency') value = toUSD(value)
        errorLabel.value = customErrorLabel || `Enter a value greater than ${value}`
        return false
      }
      if (max && parseFloat(value.toString()) > max) {
        let value: string | number = max
        if (type === 'percentage') value = toPercentage(value)
        else if (type === 'currency') value = toUSD(value)
        errorLabel.value = customErrorLabel || `Enter a value lower than ${value}`
        return false
      }
    }
    return true
  }

  return {
    isValid,
    errorLabel,
  }
}
