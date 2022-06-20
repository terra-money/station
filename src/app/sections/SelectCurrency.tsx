import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import { Grid } from "components/layout"
import { RadioGroup } from "components/form"
import { ModalButton, Mode } from "components/feedback"
import HeaderIconButton from "app/components/HeaderIconButton"
import { useActiveDenoms } from "data/queries/oracle"
import { useCurrencyState } from "data/settings/Currency"
import { readNativeDenom } from "data/token"
import { useIsClassic } from "data/query"

const SelectCurrency = () => {
  const { data: activeDenoms = [] } = useActiveDenoms()
  const [currency, setCurrency] = useCurrencyState()
  const isClassic = useIsClassic()

  return (
    <ModalButton
      modalType={Mode.SELECT}
      renderButton={(open) => (
        <HeaderIconButton onClick={open}>
          {readNativeDenom(currency, isClassic)?.symbol}
          <ArrowForwardIosIcon />
        </HeaderIconButton>
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
