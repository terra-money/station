import { useTranslation } from "react-i18next"
import { Page } from "components/layout"
import TxContext from "../TxContext"
import SwapContext from "./SwapContext"
import MultipleSwapContext from "./MultipleSwapContext"
import SwapMultipleForm from "./SwapMultipleForm"

const SwapMultipleTx = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Swap multiple coins")} small>
      <TxContext>
        <SwapContext>
          <MultipleSwapContext>
            <SwapMultipleForm />
          </MultipleSwapContext>
        </SwapContext>
      </TxContext>
    </Page>
  )
}

export default SwapMultipleTx
