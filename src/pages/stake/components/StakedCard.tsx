/*
 * @Author: lmk
 * @Date: 2022-05-27 17:37:27
 * @LastEditTime: 2022-06-07 10:57:24
 * @LastEditors: lmk
 * @Description:
 */
import { PropsWithChildren } from "react"
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

const StakedCard = (props: PropsWithChildren<Props>) => {
  const { amount, value, children } = props
  const currency = useCurrency()
  return (
    <Card
      {...props}
      onClick={has(amount) ? props.onClick : undefined}
      className={styles.card}
    >
      <Grid gap={2}>
        <span className={styles.amount}>
          <Read amount={amount} denom="umis" />{" "}
          <span className={styles.small}>{children}</span>
        </span>

        {currency !== "umis" && (
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
