import WithSearchInput from "pages/custom/WithSearchInput"
import styles from "./AddressModal.module.scss"
import { Page } from "components/layout"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { Table } from "components/layout"
import { useTranslation } from "react-i18next"
import { getMaxHeightStyle } from "utils/style"
import { AccAddress } from "@terra-money/feather.js"
import { FinderLink } from "components/general"
import { getChainNamefromID } from "data/queries/chains"
import { useNetwork } from "data/wallet"
import { truncate } from "@terra.kitchen/utils"

const AddressModalTable = ({ keyword }: { keyword: string }) => {
  const addresses = useInterchainAddresses()
  const networks = useNetwork()
  const { t } = useTranslation()
  const addressData = Object.keys(addresses).map((key) => ({
    address: addresses[key],
    name: getChainNamefromID(key, networks) ?? key,
  }))

  return (
    <Table
      dataSource={addressData}
      columns={[
        {
          title: t("Chain Name"),
          dataIndex: "name",
          render: (name: string) => <div>{name}</div>,
        },
        {
          title: t("Address"),
          dataIndex: "address",
          render: (address: AccAddress) => (
            <FinderLink value={address}>{truncate(address)}</FinderLink>
          ),
        },
      ]}
      style={getMaxHeightStyle(320)}
    />
  )
}

const AddressModal = () => {
  return (
    <Page sub>
      <WithSearchInput gap={0} placeholder="Search for a chain...">
        {(keyword: string) => <AddressModalTable keyword={keyword} />}
      </WithSearchInput>
    </Page>
  )
}

export default AddressModal
