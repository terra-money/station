import { useAddress } from "data/wallet"
import { useValidators } from "data/queries/staking"
import { getConnectedMoniker } from "data/queries/distribution"
import { LinkButton } from "components/general"

const ValidatorButton = () => {
  const address = useAddress()
  const { data: validators } = useValidators()
  const moniker = getConnectedMoniker(address, validators)
  if (!moniker) return null

  return (
    <LinkButton to="/commission" size="small" outline>
      {moniker}
    </LinkButton>
  )
}

export default ValidatorButton
