import styles from "./TokenSelector.module.scss"
import classNames from "classnames"
import { TokenInterface } from "./TokenSelector"

interface Props {
  list: Record<string, TokenInterface>
  onChange: (chain?: string) => void
  value?: string
  small?: boolean
}

const TokenList = ({ list, onChange, value, small }: Props) => {
  return (
    <div className={styles.options}>
      <div
        className={classNames(
          styles.options__container,
          small && styles.options__container__small
        )}
      >
        <button
          className={undefined === value ? styles.active : ""}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onChange(undefined)
          }}
        >
          Show all
        </button>
        {Object.values(list ?? {}).map(({ symbol, icon, token }) => (
          <button
            className={token === value ? styles.active : ""}
            key={token}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onChange(token)
            }}
          >
            <img src={icon} alt={symbol} />
            {symbol}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TokenList
