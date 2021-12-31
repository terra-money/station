import { always } from "ramda"
import BigNumber from "bignumber.js"
import { AccAddress } from "@terra-money/terra.js"
import { validateMsg } from "utils/data"

const lessThan = (max: number, label = "Amount", optional = false) => {
  return (value = 0) => {
    if (optional)
      return !value || value <= max || `${label} must be less than ${max}`

    return (
      (value > 0 && value <= max) || `${label} must be between 0 and ${max}`
    )
  }
}

const decimal = (decimals = 6, label = "Amount", optional = false) => {
  return (value = 0) => {
    return (
      (optional && !value) ||
      new BigNumber(value).times(new BigNumber(10).pow(decimals)).isInteger() ||
      `${label} must be within ${decimals} decimal points`
    )
  }
}

const input = (
  max: number,
  decimals = 6,
  label = "Amount",
  optional = false
) => {
  if (max <= 0) return always("Insufficient balance")
  return {
    required: (value = 0) => optional || !!value || `${label} is required`,
    lessThan: lessThan(max, label, optional),
    decimal: decimal(decimals, label, optional),
  }
}

const recipient = () => {
  return {
    required: (recipient = "") => !!recipient || "Recipient is required",
    validate: (recipient = "") =>
      validateRecipient(recipient) || "Invalid recipient",
  }
}

const address = (label = "Recipient", optional = false) => {
  return (address?: string) => {
    if (!address) return optional || `${label} is required`
    return (address && AccAddress.validate(address)) || "Invalid address"
  }
}

const size = (length: number, label = "Memo") => {
  return (value?: string) => {
    if (!value) return
    return new Blob([value]).size <= length || `${label} is too long`
  }
}

const memo = () => (value?: string) => {
  if (!value) return
  return (
    ["<", ">"].every((char) => !value.includes(char)) ||
    "Memo cannot include `<` or `>`"
  )
}

const msg = () => {
  return (value?: string) => {
    if (!value) return `Msg is required`
    return !!validateMsg(value) || `Msg is invalid`
  }
}

const validate = {
  input,
  decimal,
  lessThan,
  recipient,
  address,
  size,
  memo,
  msg,
}

export default validate

/* tns */
export const validateRecipient = (address: string) =>
  AccAddress.validate(address) || address.endsWith(".ust")
