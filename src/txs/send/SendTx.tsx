import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { AccAddress } from "@terra-money/terra.js"
import { getAmount } from "utils/coin"
import { useTokenBalance } from "data/queries/wasm"
import { useBankBalance } from "data/queries/bank"
import { useTokenItem } from "data/token"
import { Auto, Page } from "components/layout"
import TxContext from "../TxContext"
import SendForm from "./SendForm"
import Coins from "../../pages/wallet/Coins"
import Tokens from "../../pages/wallet/Tokens"

const SendTx = () => {
  const { t } = useTranslation()
  const bankBalance = useBankBalance()

  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""

  // if (!token) throw new Error("Token is not defined")

  const { data: cw20Balance, ...state } = useTokenBalance(token)
  const tokenItem = useTokenItem(token)

  const symbol = tokenItem?.symbol ?? ""
  const balance = AccAddress.validate(token)
    ? cw20Balance
    : getAmount(bankBalance, token)

  return token ? (
    <Page {...state} title={t("Send {{symbol}}", { symbol })}>
      <TxContext>
        {tokenItem && balance && <SendForm {...tokenItem} balance={balance} />}
      </TxContext>
    </Page>
  ) : (
    <Page {...state} title={t("Select a coin to send")}>
      <Auto columns={[<Coins />, <Tokens />]} />
    </Page>
  )
}

export default SendTx
