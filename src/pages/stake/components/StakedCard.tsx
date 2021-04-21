import { FC } from "react"
import { has } from "utils/num"
import { useCurrency } from "data/settings/Currency"
import { Grid, Card } from "components/layout"
import { Props as CardProps } from "components/layout/Card"
import { Read } from "components/token"
import styles from "./StakedCard.module.scss"

interface Props extends CardProps {
  amount: Amount
  value?: Value
}

const StakedCard: FC<Props> = ({ amount, value, children, ...props }) => {
  const currency = useCurrency()

  return (
    <Card {...props} onClick={has(amount) ? props.onClick : undefined}>
      <Grid gap={2}>
        <span className={styles.amount}>
          <Read amount={amount} denom="uluna" />{" "}
          <span className={styles.small}>{children}</span>
        </span>

        {currency !== "uluna" && (
          <Read
            amount={value}
            denom={currency}
            className={styles.value}
            auto
            approx
            block
          />
        )}
      </Grid>
    </Card>
  )
}

export default StakedCard
