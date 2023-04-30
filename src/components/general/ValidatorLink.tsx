import { ValAddress } from "@terra-money/feather.js"
import { useValidator } from "data/queries/staking"
import { FinderLink } from "../general"
import { InternalLink } from "./Internal"
import ProfileIcon from "pages/stake/components/ProfileIcon"
import { InlineFlex } from "components/layout"

interface Props {
  address: ValAddress
  internal?: boolean
  img?: boolean
}

const ValidatorLink = ({ address, internal, img }: Props) => {
  const { data: validator } = useValidator(address)

  const render = () => {
    if (!validator) return null
    const {
      description: { moniker, identity },
    } = validator
    return internal ? (
      <InternalLink to={`/validator/${address}`}>
        <InlineFlex gap={8}>
          {img && <ProfileIcon src={identity} size={22} />} {moniker}
        </InlineFlex>
      </InternalLink>
    ) : (
      <FinderLink value={address} validator>
        <InlineFlex gap={8}>
          {img && <ProfileIcon src={identity} size={22} />} {moniker}
        </InlineFlex>
      </FinderLink>
    )
  }

  return render()
}

export default ValidatorLink
