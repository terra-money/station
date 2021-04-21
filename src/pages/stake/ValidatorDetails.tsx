import { useTranslation } from "react-i18next"
import { useTerraValidator } from "data/Terra/TerraAPI"
import { Col, Page, Auto } from "components/layout"
import { useGoBackOnError } from "app/routes"
import useAddressParams from "./useAddressParams"
import ValidatorCompact from "./ValidatorCompact"
import ValidatorSummary from "./ValidatorSummary"
import ValidatorActions from "./ValidatorActions"

const ValidatorDetails = () => {
  const { t } = useTranslation()
  const address = useAddressParams()
  const { data: validator, ...state } = useTerraValidator(address)

  useGoBackOnError(state)

  const render = () => {
    if (!validator) return null

    return (
      <Auto
        columns={[
          <Col>
            <ValidatorCompact />
            <ValidatorSummary validator={validator} />
          </Col>,
          <ValidatorActions destination={validator.operator_address} />,
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
