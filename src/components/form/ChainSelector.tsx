import { useMemo } from "react"
import { useNetworks } from "app/InitNetworks"
import ChainInput from "./ChainInput"

interface Props {
  chainsList: string[]
  onChange: (chain: string) => void
  value: string
  small?: boolean
}

const ChainSelector = ({ chainsList, onChange, value, small }: Props) => {
  const { networks } = useNetworks()
  const allNetworks = useMemo(
    () => ({
      ...networks.localterra,
      ...networks.classic,
      ...networks.testnet,
      ...networks.mainnet,
    }),
    [networks]
  )

  const list = useMemo(
    () => chainsList.map((chainID) => allNetworks[chainID]),
    [allNetworks, chainsList]
  )

  return (
    <ChainInput
      options={list.map((network) => ({
        id: network.chainID,
        name: network.name,
        icon: network.icon,
      }))}
      value={value}
      onChange={onChange}
      small={small}
    />
  )
}

export default ChainSelector
