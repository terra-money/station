import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import { Grid, Flex } from "components/layout"
import { RadioGroup } from "components/form"
import { ModalButton, Mode } from "components/feedback"
import { useActiveDenoms } from "data/queries/oracle"
import { useCurrency, useCurrencyState } from "data/settings/Currency"
import { readNativeDenom } from "data/token"
import { useIsClassic } from "data/query"

const SelectCurrency = () => {
  const { data: activeDenoms = [] } = useActiveDenoms()
  const [, setCurrency] = useCurrencyState()
  const currency = useCurrency()
  const isClassic = useIsClassic()

  return (
    <ModalButton
      modalType={Mode.SELECT}
      renderButton={(open) => (
        <div onClick={open}>
          <Flex>
            {readNativeDenom(currency, isClassic)?.symbol}
            <ArrowForwardIosIcon />
          </Flex>
        </div>
      )}
    >
      <Grid gap={20}>
        <RadioGroup
          options={activeDenoms.map((denom) => {
            return {
              value: denom,
              label: readNativeDenom(denom, isClassic)?.symbol,
            }
          })}
          value={currency}
          onChange={setCurrency}
          mobileModal={true}
        />
      </Grid>
    </ModalButton>
  )
}

export default SelectCurrency
