import { ReactNode } from "react"
import { Flex } from "../layout"
import TokenIcon from "./TokenIcon"
import styles from "./Token.module.scss"

interface Props extends Partial<TokenItem> {
  // customizable
  token: Token
  extra?: ReactNode
  className?: string

  /* customize */
  title?: string
  description?: ReactNode
}

// Custom token search result
const Token = ({ token, icon, symbol, name, ...props }: Props) => {
  const { extra, className, title = symbol, description } = props

  return (
    <Flex start gap={12} className={className}>
      <TokenIcon token={token} icon={icon} />

      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {name && <h2 className={styles.name}>{name}</h2>}
        {description && <p className={styles.description}>{description}</p>}
      </header>

      {extra && <aside className={styles.extra}>{extra}</aside>}
    </Flex>
  )
}

export default Token
