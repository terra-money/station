/*
 * @Author: lmk
 * @Date: 2022-05-25 11:23:10
 * @LastEditTime: 2022-06-09 09:55:48
 * @LastEditors: lmk
 * @Description:
 */
import { ValAddress } from "@terra-money/terra.js"
import { getFindMoniker, useValidators } from "data/queries/staking"
import { FinderLink } from "../general"
import { InternalLink } from "./Internal"

interface Props {
  address: ValAddress
  internal?: boolean
  isLink?: boolean
}

const ValidatorLink = ({ address, internal, isLink = true }: Props) => {
  const { data: validators } = useValidators()

  const render = () => {
    if (!validators) return null
    const moniker = getFindMoniker(validators)(address)
    return internal ? (
      isLink ? (
        <InternalLink to={`/validator/${address}`}>{moniker}</InternalLink>
      ) : (
        <span>{moniker}</span>
      )
    ) : (
      <FinderLink value={address} validator>
        {moniker}
      </FinderLink>
    )
  }

  return render()
}

export default ValidatorLink
