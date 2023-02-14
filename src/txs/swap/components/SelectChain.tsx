import { useMultichainSwap } from "../MultichainSwapContext"

interface SelectChainProps {
  value: string
  onChange: (value: string) => void
}

export const SelectChain = ({ value, onChange }: SelectChainProps) => {
  const { chains } = useMultichainSwap()

  console.log(chains)

  return <p>coming soon</p>
}
