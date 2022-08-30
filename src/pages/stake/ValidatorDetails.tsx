/*
 * @Author: lmk
 * @Date: 2022-05-30 10:44:28
 * @LastEditTime: 2022-06-09 15:49:22
 * @LastEditors: lmk
 * @Description:
 */
import { useTranslation } from "react-i18next"
import { useValidator } from "data/queries/staking"
import { useTerraValidator } from "data/Terra/TerraAPI"
import { Col, Page, Auto } from "components/layout"
import { useGoBackOnError } from "app/routes"
import useAddressParams from "./useAddressParams"
import ValidatorCompact from "./ValidatorCompact"
import ValidatorSummary from "./ValidatorSummary"
import ValidatorCommission from "./ValidatorCommission"
import ValidatorVotes from "./ValidatorVotes"
import ValidatorAddresses from "./ValidatorAddresses"
import ValidatorActions from "./ValidatorActions"

const ValidatorDetails = () => {
  const { t } = useTranslation()
  const address = useAddressParams()
  const { data: validator, ...state } = useValidator(address)
  const { data: TerraValidator } = useTerraValidator(address)

  useGoBackOnError(state)

  const render = () => {
    if (!validator) return null

    return (
      <Auto
        columns={[
          <Col>
            <ValidatorCompact />
            <ValidatorActions destination={validator.operator_address} />
          </Col>,
          <Col>
            {TerraValidator && (
              <>
                <ValidatorSummary validator={TerraValidator} />
                <ValidatorCommission validator={TerraValidator} />
                <ValidatorVotes validator={TerraValidator} />
              </>
            )}

            <ValidatorAddresses validator={validator} />
          </Col>,
        ]}
      />
    )
  }

  return (
    <Page {...state} title={t("Validator details")}>
      {render()}
    </Page>
  )
}

export default ValidatorDetails
