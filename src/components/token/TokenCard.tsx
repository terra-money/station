import { PropsWithChildren } from "react"
import classNames from "classnames/bind"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import { FormatConfig } from "@terra-money/terra-utils"
import { getMaxHeightStyle } from "utils/style"
import { Flex } from "../layout"
import TokenIcon from "./TokenIcon"
import Read from "./Read"
import styles from "./TokenCard.module.scss"

const cx = classNames.bind(styles)

interface Props extends Partial<TokenItem>, Partial<FormatConfig> {
  // customizable
  token: Token
  amount?: Amount
  balance?: Amount
  className?: string
  value?: Value
  valueCurrency?: Token
  valueConfig?: Partial<FormatConfig>
}

// Where to use:
// 1. Swap form
// 2. Withdraw rewards
// 3. others - if too many tokens to display on the screen
const TokenCard = ({ token, icon, symbol, name, balance, ...props }: Props) => {
  const { amount = balance, value, className, ...rest } = props
  const { valueCurrency, valueConfig, ...config } = rest

  return (
    <article className={classNames(styles.item, className)}>
      <Flex start gap={10} className={styles.main}>
        <div className={styles.wrapper}>
          <TokenIcon token={token} icon={icon} />
        </div>

        <header className={styles.detail}>
          <h1 className={styles.title}>{symbol}</h1>
          {name && <h2 className={styles.name}>{name}</h2>}
        </header>
      </Flex>

      {amount && (
        <footer className={styles.footer}>
          <p className={styles.balance}>
            {balance && <AccountBalanceWalletIcon fontSize="inherit" />}
            <Read amount={amount} {...config} />
          </p>
        </footer>
      )}
    </article>
  )
}

export default TokenCard

/* layout */
interface GridProps {
  maxHeight?: number | true
  singleColumn?: boolean
}

export const TokenCardGrid = (props: PropsWithChildren<GridProps>) => {
  const { children, maxHeight, singleColumn } = props

  return (
    <section
      className={cx(styles.grid, { single: singleColumn })}
      style={getMaxHeightStyle(maxHeight, 320)}
    >
      {children}
    </section>
  )
}
