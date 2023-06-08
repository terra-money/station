import { HTMLAttributes, useState } from "react"
import classNames from "classnames/bind"
import { AccAddress } from "@terra-money/feather.js"
import { isDenomIBC } from "@terra-money/terra-utils"
import { getIcon } from "data/token"
import styles from "./TokenIcon.module.scss"

const cx = classNames.bind(styles)

interface Props extends HTMLAttributes<HTMLImageElement> {
  token: Token
  icon?: string
  size?: number | "inherit"
}

const TokenIcon = ({ token, icon, size, ...rest }: Props) => {
  const [isError, setIsError] = useState(false)

  const defaultIcon = AccAddress.validate(token)
    ? getIcon("CW.svg")
    : isDenomIBC(token)
    ? getIcon("IBC.svg")
    : getIcon("Terra.svg")

  const src = !icon || isError ? defaultIcon : icon
  const sizes =
    size === "inherit"
      ? undefined
      : {
          width: size ?? 24,
          height: size ?? 24,
        }

  const attrs = { ...rest, ...sizes, src, className: cx(styles.icon, size) }
  return <img {...attrs} onError={() => setIsError(true)} alt="" />
}

export default TokenIcon
