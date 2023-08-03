import { ValAddress } from "@terra-money/feather.js"
import { useValidator } from "data/queries/staking"
import { InternalLink } from "./Internal"
import { useNativeDenoms, TokenType } from "data/token"
import { ValidatorLink } from "components/general"
import { InlineFlex } from "components/layout"
import ProfileIcon from "pages/stake/components/ProfileIcon"

interface Props {
  address: ValAddress
  denom: string
  internal?: boolean
  img?: boolean
}

const StakingAssetLink = ({ address, denom }: Props) => {
  const { data: validator } = useValidator(address)
  const readNativeDenom = useNativeDenoms()

  const render = () => {
    if (!validator) return null
    const {
      description: { moniker, identity },
    } = validator
    return readNativeDenom(denom).type === TokenType.IBC ? (
      <InternalLink
        to={`/stake/${address}/${denom.replaceAll("/", "=")}#Undelegate`}
      >
        <InlineFlex gap={8}>
          <ProfileIcon src={identity} size={22} /> {moniker}
        </InlineFlex>
      </InternalLink>
    ) : (
      <ValidatorLink address={address} internal img />
    )
  }
  return render()
}

export default StakingAssetLink
