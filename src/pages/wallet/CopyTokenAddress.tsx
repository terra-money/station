import { CopyIcon } from "components/general"
import { useWhitelist } from "data/queries/chains"
import { useNetworkName } from "data/wallet"

const CopyTokenAddress = ({
  chain,
  token,
}: {
  chain: string
  token: string
}) => {
  const { ibcDenoms } = useWhitelist()
  const networkName = useNetworkName()

  const ibc = ibcDenoms[networkName]
  const denom = Object.keys(ibc ?? {}).find(
    (key) => ibc[key]?.chainID === chain && ibc[key].token === token
  )

  return (
    <span style={{ marginLeft: 10 }}>
      <CopyIcon text={denom || token} />
    </span>
  )
}
export default CopyTokenAddress
