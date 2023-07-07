import { always } from "ramda"
import BigNumber from "bignumber.js"
import { AccAddress } from "@terra-money/feather.js"
import { validateMsg } from "utils/data"
import wordlist from "bip39/src/wordlists/english.json"
import { getChainIDFromAddress } from "utils/bech32"
import { InterchainNetwork } from "types/network"

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

const ibc = (
  networks: Record<string, InterchainNetwork>,
  sourceChain: string,
  token: string,
  getIBCChannel: (chains: {
    from: string
    to: string
    tokenAddress: AccAddress
    icsChannel?: string
  }) => string | undefined,
  isAxelar?: boolean
) => {
  return {
    ibc: (recipient = "") => {
      const destinationChain = getChainIDFromAddress(recipient, networks)
      if (!destinationChain) return "Invalid recipient"

      if (sourceChain === destinationChain) return true

      if (!AccAddress.validate(token)) {
        const channel = getIBCChannel({
          from: sourceChain,
          to: destinationChain,
          tokenAddress: token,
        })
        if (!channel)
          return `Cannot find IBC channel from ${sourceChain} to ${destinationChain}`
      } else {
        const channel = getIBCChannel({
          from: sourceChain,
          to: destinationChain,
          tokenAddress: token,
          // TODO: pass the ICS chennel if needed (should be as it is for validation)
        })
        if (!channel)
          return `IBC transfers are not yet available for this CW20 token`
      }

      return true
    },
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

const isNotMnemonic = () => (value?: string) => {
  if (!value) return
  const seed = value.trim().split(" ")
  if (seed.length === 12 || seed.length === 24) {
    const isNotMnemonic = seed.find((word) => !wordlist.includes(word))
    return isNotMnemonic || `You cannot enter a mnemonic in the memo field.`
  }
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
  ibc,
  address,
  size,
  memo,
  isNotMnemonic,
  msg,
}

export default validate

/* tns */
export const validateRecipient = (address: string) =>
  AccAddress.validate(address) || address.endsWith(".ust")
