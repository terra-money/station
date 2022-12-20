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
import { CopyIcon } from "components/general"
import { TokenIcon } from "components/token"

const AddressModalTable = ({ keyword }: { keyword: string }) => {
  const addresses = useInterchainAddresses() as { [key: string]: AccAddress }
  const networks = useNetwork()
  const { t } = useTranslation()
  const addressData = Object.keys(addresses).map((key) => ({
    address: addresses?.[key],
    chainName: getChainNamefromID(key, networks) ?? key,
    id: key,
  }))

  return (
    <Table
      className={styles.table}
      size="small"
      dataSource={addressData}
      filter={({ chainName }) => {
        if (!keyword) return true
        if (chainName.toLowerCase().includes(keyword.toLowerCase())) return true
        return false
      }}
      columns={[
        {
          title: t("Chain Name"),
          dataIndex: "chainName",
          align: "left",
          render: (chainName: string, { id }) => (
            <div className={styles.chain}>
              <TokenIcon
                token={networks[id]?.baseAsset}
                icon={networks[id]?.icon}
              />
              <div className={styles.name}>{chainName}</div>
            </div>
          ),
        },
        {
          title: t("Address"),
          dataIndex: "address",
          render: (address: AccAddress) => (
            <div className={styles.address}>
              <FinderLink value={address}>{truncate(address)}</FinderLink>
              <CopyIcon text={address} />
            </div>
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
      <WithSearchInput gap={10} placeholder="Search for a chain...">
        {(keyword: string) => <AddressModalTable keyword={keyword} />}
      </WithSearchInput>
    </Page>
  )
}

export default AddressModal
