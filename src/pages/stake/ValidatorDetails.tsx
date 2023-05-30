import { useTranslation } from "react-i18next"
import { useValidator } from "data/queries/staking"
import { Col, Page, Auto } from "components/layout"
import { useGoBackOnError } from "app/routes"
import useAddressParams from "./useAddressParams"
import ValidatorCompact from "./ValidatorCompact"
import ValidatorCommission from "./ValidatorCommission"
import ValidatorAddresses from "./ValidatorAddresses"
import ValidatorActions from "./ValidatorActions"

const ValidatorDetails = () => {
  const { t } = useTranslation()
  const address = useAddressParams()
  const { data: validator, ...state } = useValidator(address)

  useGoBackOnError(state)

  const render = () => {
    if (!validator) return null

    return (
      <Auto
        columns={[
          <Col>
            <ValidatorCompact />
            <ValidatorCommission validator={validator} />
            <ValidatorAddresses validator={validator} />
          </Col>,
          <ValidatorActions destination={validator.operator_address} />,
        ]}
      />
    )
  }

  return (
    <Page {...state} title={t("Validator details")} backButtonPath="/stake">
      {render()}
    </Page>
  )
}

export default ValidatorDetails
