import { forwardRef, PropsWithChildren } from "react"
import { useTranslation } from "react-i18next"
import { isDenomTerraNative } from "@terra.kitchen/utils"
import { WithTokenItem } from "data/token"
import { ModalButton, ModalRef, Mode } from "components/feedback"
import { TokenCard, TokenCardGrid } from "components/token"
import is from "auth/scripts/is"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"

interface Item extends CoinData {
  value?: Value
}

interface Props {
  title: string
  list: Item[]
}

const SelectDenom = forwardRef<ModalRef, PropsWithChildren<Props>>(
  (props, ref) => {
    const { title, list } = props
    const { t } = useTranslation()

    if (!(list.length > 1)) return null

    return (
      <ModalButton
        ref={ref}
        title={title}
        modalType={is.mobile() ? Mode.FULL : Mode.DEFAULT}
        renderButton={(open) => (
          <div onClick={open}>
            {is.mobile() ? (
              <ArrowForwardIosIcon style={{ fontSize: 12 }} />
            ) : (
              t("Show all")
            )}
          </div>
        )}
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
                  />
                )}
              </WithTokenItem>
            ))}
        </TokenCardGrid>
      </ModalButton>
    )
  }
)

export default SelectDenom
