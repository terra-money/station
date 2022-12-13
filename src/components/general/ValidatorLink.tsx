import { ValAddress } from "@terra-money/terra.js"
import { getFindMoniker, useValidators } from "data/queries/staking"
import { FinderLink } from "../general"
import { InternalLink } from "./Internal"

interface Props {
  address: ValAddress
  internal?: boolean
}

const ValidatorLink = ({ address, internal }: Props) => {
  const { data: validators } = useValidators()

  const render = () => {
    if (!validators) return null
    const moniker = getFindMoniker(validators)(address)
    return internal ? (
      <InternalLink to={`/validator/${address}`}>{moniker}</InternalLink>
    ) : (
      <FinderLink value={address} validator>
        {moniker}
      </FinderLink>
    )
  }

  return render()
}

export default ValidatorLink
