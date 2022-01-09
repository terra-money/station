import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useNetworkState } from "data/wallet"
import { useCustomNetworks } from "data/settings/CustomNetworks"
import { Grid } from "components/layout"
import CustomItem from "txs/AddressBook/CustomItem"

const ManageNetworksForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [, setNetwork] = useNetworkState()
  const { list, remove } = useCustomNetworks()
  const empty = !list.length

  useEffect(() => {
    if (empty) navigate("/")
  }, [empty, navigate])

  return (
    <Grid gap={12}>
      {list.map((item) => {
        const { name, chainID, lcd } = item
        return (
          <CustomItem
            name={name}
            contents={[
              { title: t("Chain ID"), desc: chainID },
              { title: t("LCD"), desc: lcd },
            ]}
            onClick={() => setNetwork(name)}
            onDelete={() => remove(name)}
            key={name}
          />
        )
      })}
    </Grid>
  )
}

export default ManageNetworksForm
