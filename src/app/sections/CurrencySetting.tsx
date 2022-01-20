import { readDenom } from "@terra.kitchen/utils"
import { useActiveDenoms } from "data/queries/oracle"
import { useCurrencyState } from "data/settings/Currency"
import { RadioGroup } from "components/form"

const CurrencySetting = () => {
  const { data: activeDenoms = [] } = useActiveDenoms()
  const [currency, setCurrency] = useCurrencyState()

  return (
    <RadioGroup
      options={activeDenoms.map((denom) => {
        return { value: denom, label: readDenom(denom) }
      })}
      value={currency}
      onChange={setCurrency}
    />
  )
}

export default CurrencySetting
