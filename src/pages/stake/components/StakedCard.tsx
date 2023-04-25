import { useTranslation } from "react-i18next"
import { PropsWithChildren } from "react"
import BigNumber from "bignumber.js"
import { Grid, Card, Flex } from "components/layout"
import { Props as CardProps } from "components/layout/Card"
import { Read } from "components/token"
import styles from "./StakedCard.module.scss"
import { useCurrency } from "data/settings/Currency"

interface Props extends CardProps {
  amount?: Amount
  value: Value
  denom?: string
  cardName: string
  showTokens?: boolean
}

const StakedCard = (props: PropsWithChildren<Props>) => {
  const { value, amount, denom, showTokens, children } = props
  const currency = useCurrency()
  const { t } = useTranslation()

  return (
    <Card
      {...props}
      className={styles.card_helper}
      onClick={
        new BigNumber(value).gt(0.0) || new BigNumber(amount || 0).gt(0.0)
          ? props.onClick
          : undefined
      }
    >
      {(value !== "-1" && value !== "0") ||
      (amount !== undefined && new BigNumber(amount || 0).gt(0.0)) ? (
        <Flex
          wrap
          gap={12}
          style={{ justifyContent: "space-between", alignItems: "flex-end" }}
        >
          <span className={styles.value}>
            {currency.symbol} <Read amount={value} decimals={0} fixed={2} />
            <span className={styles.small}>{children}</span>
          </span>
          {new BigNumber(amount || -1).gt(0.0) && showTokens && (
            <Read
              amount={amount}
              decimals={0}
              fixed={2}
              denom={denom}
              className={styles.amount}
            />
          )}
        </Flex>
      ) : (
        <Grid style={{ alignItems: "end", height: "100%" }}>
          {!props.isLoading ? t("None on selected chain") : ""}
        </Grid>
      )}
    </Card>
  )
}

export default StakedCard
