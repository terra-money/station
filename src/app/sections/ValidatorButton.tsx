import { useAddress, useChainID } from "data/wallet"
import { useValidators } from "data/queries/staking"
import { getConnectedMoniker } from "data/queries/distribution"
import { LinkButton } from "components/general"

const ValidatorButton = () => {
  const chainID = useChainID()
  const address = useAddress()
  const { data: validators } = useValidators(chainID)
  if (!address) return null
  const moniker = getConnectedMoniker(address, validators ?? [])
  if (!moniker) return null

  return (
    <LinkButton to="/commission" size="small" outline>
      {moniker}
    </LinkButton>
  )
}

export default ValidatorButton
