import { PropsWithChildren } from "react"
import { has } from "utils/num"
import { Grid, Card } from "components/layout"
import { Props as CardProps } from "components/layout/Card"
import { Read } from "components/token"
import styles from "./StakedCard.module.scss"
import { useCurrency } from "data/settings/Currency"

interface Props extends CardProps {
  amount: Amount
  value?: Value
}

const StakedCard = (props: PropsWithChildren<Props>) => {
  const { amount, children } = props
  const currency = useCurrency()

  return (
    <Card {...props} onClick={has(amount) ? props.onClick : undefined}>
      <Grid gap={2}>
        <span className={styles.amount}>
          {currency.symbol}
          <Read amount={amount} decimals={0} fixed={2} />
          <span className={styles.small}>{children}</span>
        </span>
      </Grid>
    </Card>
  )
}

export default StakedCard
