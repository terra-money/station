import { useState } from "react"
import { useTranslation } from "react-i18next"
import ManageSearchIcon from "@mui/icons-material/ManageSearch"
import { AccAddress, ContractInfo } from "@terra-money/feather.js"
import createContext from "utils/createContext"
import { useContractInfo } from "data/queries/wasm"
import { Page, Card, Grid } from "components/layout"
import { Fetching, State, Empty } from "components/feedback"
import { SearchInput } from "components/form"
import ContractActions from "./ContractActions"
import ContractItem from "./ContractItem"

export const [useContract, ContractProvider] =
  createContext<ContractInfo>("useContract")

const Contract = () => {
  const { t } = useTranslation()

  /* submit */
  const [address, setAddress] = useState("")
  const { data: result, ...state } = useContractInfo(address)

  return (
    <Page title={t("Contract")} extra={<ContractActions />}>
      <Grid gap={20}>
        <SearchInput
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        {state.error ? (
          <Card>
            <Empty />
          </Card>
        ) : !AccAddress.validate(address) ? (
          <Card>
            <State icon={<ManageSearchIcon fontSize="inherit" />}>
              {t("Search by contract address")}
            </State>
          </Card>
        ) : (
          <Fetching {...state}>
            {result && (
              <ContractProvider value={result}>
                <ContractItem {...result} />
              </ContractProvider>
            )}
          </Fetching>
        )}
      </Grid>
    </Page>
  )
}

export default Contract
