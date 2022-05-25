/*
 * @Author: lmk
 * @Date: 2022-05-25 15:23:04
 * @LastEditTime: 2022-05-25 17:38:38
 * @LastEditors: lmk
 * @Description:
 */
import { useTranslation } from "react-i18next"
import { useConnectedMoniker } from "data/queries/distribution"
import { Page, Card } from "components/layout"
import TxContext from "../TxContext"
import WithdrawCommissionForm from "./WithdrawCommissionForm"

const WithdrawCommissionTx = () => {
  const { t } = useTranslation()
  const moniker = useConnectedMoniker()

  return (
    <Page title={t("Withdraw commission")} small>
      {moniker && (
        <Card title={moniker}>
          <TxContext>
            <WithdrawCommissionForm />
          </TxContext>
        </Card>
      )}
    </Page>
  )
}

export default WithdrawCommissionTx
