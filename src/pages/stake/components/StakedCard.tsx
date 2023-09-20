import { useTranslation } from "react-i18next"
import { PropsWithChildren } from "react"
import { Grid, Card, Flex } from "components/layout"
import { Props as CardProps } from "components/layout/Card"
import { Read, ReadToken } from "components/token"
import styles from "./StakedCard.module.scss"
import { useCurrency } from "data/settings/Currency"

interface Props extends CardProps {
  amount?: Amount
  hideAmount?: boolean
  value: Value
  denom?: string
  cardName: string
  forceClickAction?: boolean
}

const StakedCard = (props: PropsWithChildren<Props>) => {
  const { value, amount, denom, hideAmount, forceClickAction, children } = props
  const currency = useCurrency()
  const { t } = useTranslation()

  return (
    <Card
      {...props}
      className={styles.card_helper}
      onClick={
        forceClickAction || Number(value) > 0 || Number(amount) > 0
          ? props.onClick
          : undefined
      }
    >
      {value ? (
        <Flex
          wrap
          gap={12}
          style={{ justifyContent: "space-between", alignItems: "flex-end" }}
        >
          <span className={styles.value}>
            {currency.symbol} <Read amount={value} decimals={0} fixed={2} />
            <span className={styles.small}>{children}</span>
          </span>
          {hideAmount ? (
            ""
          ) : Number(amount) > 0 ? (
            <ReadToken
              amount={amount}
              decimals={0}
              fixed={2}
              denom={denom ?? ""}
              className={styles.amount}
            />
          ) : (
            ""
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
