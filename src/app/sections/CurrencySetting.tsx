import { useSupportedFiat } from "data/queries/coingecko"
import { useCurrencyState } from "data/settings/Currency"
import { RadioGroup } from "components/form"

const CurrencySetting = () => {
  const { data: fiatList = [] } = useSupportedFiat()
  const [currency, setCurrency] = useCurrencyState()

  return (
    <RadioGroup
      options={fiatList.map((fiat) => {
        return { value: fiat.id, label: `${fiat.unit} - ${fiat.name}` }
      })}
      value={currency.id}
      onChange={(value) => {
        setCurrency(
          fiatList.find((fiat) => fiat.id === value) as {
            name: string
            unit: string
            id: string
          }
        )
      }}
    />
  )
}

export default CurrencySetting
