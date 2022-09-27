import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { AccAddress } from "@terra-money/terra.js"
import { getAmount } from "utils/coin"
import { useTokenBalance } from "data/queries/wasm"
import { useBankBalance } from "data/queries/bank"
import { useTokenItem } from "data/token"
import { Page } from "components/layout"
import TxContext from "../TxContext"
import SendForm from "./SendForm"

const SendTx = () => {
  const { t } = useTranslation()
  const bankBalance = useBankBalance()

  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  if (!token) throw new Error("Token is not defined")

  const { data: cw20Balance, ...state } = useTokenBalance(token)
  const tokenItem = useTokenItem(token)

  const symbol = tokenItem?.symbol ?? ""
  const balance = AccAddress.validate(token)
    ? cw20Balance
    : getAmount(bankBalance, token)

  return (
    <Page {...state} title={t("Send {{symbol}}", { symbol })}>
      <TxContext>
        {tokenItem && balance && <SendForm {...tokenItem} balance={balance} />}
      </TxContext>
    </Page>
  )
}

export default SendTx
