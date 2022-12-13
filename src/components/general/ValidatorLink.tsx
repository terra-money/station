import { ValAddress } from "@terra-money/feather.js"
import { useValidator } from "data/queries/staking"
import { FinderLink } from "../general"
import { InternalLink } from "./Internal"

interface Props {
  address: ValAddress
  internal?: boolean
}

const ValidatorLink = ({ address, internal }: Props) => {
  const { data: validator } = useValidator(address)

  const render = () => {
    if (!validator) return null
    const {
      description: { moniker },
    } = validator
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
