import { ForwardedRef, forwardRef, InputHTMLAttributes, ReactNode } from "react"
import classNames from "classnames/bind"
import SearchIcon from "@mui/icons-material/Search"
import { WithTokenItem } from "data/token"
import { Flex } from "../layout"
import styles from "./Input.module.scss"

const cx = classNames.bind(styles)

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  token?: Token
  selectBefore?: ReactNode
  actionButton?: {
    icon: ReactNode
    onClick: () => void
  }
}

const Input = forwardRef(
  (
    { selectBefore, token, actionButton, ...attrs }: Props,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <div className={styles.wrapper}>
        {selectBefore}

        <input
          {...attrs}
          className={cx(styles.input, {
            before: token || actionButton,
            after: selectBefore,
          })}
          autoComplete="off"
          ref={ref}
        />

        {token && (
          <WithTokenItem token={token}>
            {({ symbol }) => (
              <Flex className={classNames(styles.symbol, styles.after)}>
                {symbol}
              </Flex>
            )}
          </WithTokenItem>
        )}

        {actionButton && (
          <button
            type="button"
            className={classNames(styles.symbol, styles.after)}
            onClick={(e) => {
              actionButton.onClick()
              e.stopPropagation()
              e.preventDefault()
            }}
          >
            {actionButton.icon}
          </button>
        )}
      </div>
    )
  }
)

export default Input

/* search */
export const SearchInput = forwardRef(
  (
    attrs: InputHTMLAttributes<HTMLInputElement> & {
      padding?: boolean
      small?: boolean
      inline?: boolean
      extra?: ReactNode
    },
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <div
        className={classNames(
          styles.wrapper,
          styles.search,
          attrs.small && styles.search__small,
          attrs.inline && styles.search__inline
        )}
        style={attrs.padding ? {} : { margin: 0 }}
      >
        <input
          {...attrs}
          className={classNames(
            styles.input,
            attrs.small && styles.input__small
          )}
          inputMode="search"
          autoComplete="off"
          ref={ref}
        />

        <SearchIcon className={styles.icon} />
        {attrs.extra}
      </div>
    )
  }
)
