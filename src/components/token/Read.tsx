import { ForwardedRef, forwardRef, Fragment } from "react"
import classNames from "classnames/bind"
import { FormatConfig } from "@terra-money/terra-utils"
import { formatPercent, readAmount, truncate } from "@terra-money/terra-utils"
import { WithTokenItem } from "data/token"
import styles from "./Read.module.scss"

const cx = classNames.bind(styles)

interface Props extends Partial<FormatConfig> {
  amount?: Amount | Value
  denom?: Denom
  token?: Token

  approx?: boolean
  block?: boolean
  className?: string
  auto?: boolean
}

const Read = forwardRef(
  (
    { amount, denom, approx, block, auto, ...props }: Props,
    ref: ForwardedRef<HTMLSpanElement>
  ) => {
    if (!(amount || Number.isFinite(amount))) return null

    const comma = !(typeof props.comma === "boolean" && props.comma === false)

    const fixed = !auto
      ? props.fixed
      : Number(amount) >= Math.pow(10, (props.decimals ?? 6) + 3)
      ? 0
      : Number(amount) < Math.pow(10, props.decimals ?? 6)
      ? props.decimals
      : 2

    const lessThanFloor = fixed && Math.pow(10, -fixed)
    const lessThanFixed =
      amount &&
      lessThanFloor &&
      Number(amount) > 0 &&
      Number(amount) < lessThanFloor

    const config = { ...props, comma, fixed }
    const [integer, decimal] = readAmount(amount, config).split(".")

    const renderDecimal = () => {
      return (
        <span className={cx({ small: !props.prefix })}>
          {lessThanFixed
            ? `.${lessThanFloor.toString().split(".")[1]}`
            : `.${decimal || (0).toFixed(fixed || 2).split(".")[1]}`}
        </span>
      )
    }

    const renderSymbol = () => {
      const token = props.token ?? denom

      if (!token) return null

      return (
        <span className={styles.small}>
          {" "}
          <WithTokenItem token={token}>
            {({ symbol }) => symbol ?? truncate(token)}
          </WithTokenItem>
        </span>
      )
    }

    const className = cx(styles.component, { block }, props.className)

    return (
      <span className={className} ref={ref}>
        {approx && "≈ "}
        {!!lessThanFixed && "<"}
        {integer}
        {renderDecimal()}
        {renderSymbol()}
      </span>
    )
  }
)

export default Read

/* percent */
interface PercentProps extends Partial<FormatConfig> {
  children?: string | number
}

export const ReadPercent = forwardRef(
  (
    { children: value, ...config }: PercentProps,
    ref: ForwardedRef<HTMLSpanElement>
  ) => {
    const [integer, decimal] = value
      ? formatPercent(value, config).split(".")
      : []

    return (
      <span className={styles.component} ref={ref}>
        {(integer ?? "0").replace(/\B(?=(\d{3})+(?!\d))/g, "'")}
        {decimal && (
          <span className={cx({ small: Number(integer) })}>
            {decimal && `.${decimal}`}
          </span>
        )}
        <span className={styles.small}>%</span>
      </span>
    )
  }
)

/* helpers */
export const ReadMultiple = ({ list }: { list: Props[] }) => {
  return (
    <>
      {list.map((item, index) => (
        <Fragment key={index}>
          {!!index && " + "}
          <Read {...item} />
        </Fragment>
      ))}
    </>
  )
}
