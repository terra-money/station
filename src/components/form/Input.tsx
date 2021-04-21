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
}

const Input = forwardRef(
  (
    { selectBefore, token, ...attrs }: Props,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <div className={styles.wrapper}>
        {selectBefore}

        <input
          {...attrs}
          className={cx(styles.input, { before: token, after: selectBefore })}
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
      </div>
    )
  }
)

export default Input

/* search */
export const SearchInput = forwardRef(
  (
    attrs: InputHTMLAttributes<HTMLInputElement>,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <div className={classNames(styles.wrapper, styles.search)}>
        <input
          {...attrs}
          className={styles.input}
          inputMode="search"
          autoComplete="off"
          ref={ref}
        />

        <SearchIcon className={styles.icon} />
      </div>
    )
  }
)
