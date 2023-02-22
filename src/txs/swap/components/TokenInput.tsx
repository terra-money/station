import { ReactNode } from "react"
import { SwapToken } from "../CurrentChainTokensContext"

interface TokenInputProps {
  value?: string
  onChange: (value: string) => void
  options: SwapToken[]

  addonAfter?: ReactNode
}

export const TokenInput = ({
  value,
  onChange,
  options,
  addonAfter,
}: TokenInputProps) => {
  return <div>token input will be here {addonAfter}</div>
}
