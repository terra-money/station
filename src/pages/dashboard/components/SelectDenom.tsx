import { useTranslation } from "react-i18next"
import { isDenomTerraNative } from "@terra.kitchen/utils"
import { WithTokenItem } from "data/token"
import { ModalButton, Mode } from "components/feedback"
import { TokenCard, TokenCardGrid } from "components/token"
import is from "auth/scripts/is"

interface Item extends CoinData {
  value?: Value
}

interface Props {
  title: string
  list: Item[]
}

const SelectDenom = ({ title, list }: Props) => {
  const { t } = useTranslation()

  if (!(list.length > 1)) return null

  return (
    <ModalButton
      title={title}
      modalType={is.mobile() ? Mode.FULL : Mode.DEFAULT}
      renderButton={(open) => <button onClick={open}>{t("Show all")}</button>}
    >
      <TokenCardGrid maxHeight>
        {list
          .filter(({ denom }) => isDenomTerraNative(denom))
          .map(({ amount, denom, value }) => (
            <WithTokenItem token={denom} key={denom}>
              {(item) => (
                <TokenCard
                  {...item}
                  amount={amount}
                  value={value}
                  valueConfig={{ prefix: true }}
                  name="" // remove name
                  prefix
                />
              )}
            </WithTokenItem>
          ))}
      </TokenCardGrid>
    </ModalButton>
  )
}

export default SelectDenom
