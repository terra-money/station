import { AccAddress } from "@terra-money/feather.js"
import { FinderLink } from "components/general"
import { getChainNamefromID } from "data/queries/chains"
import { useNetwork } from "data/wallet"
import { truncate } from "@terra.kitchen/utils"
import { CopyIcon } from "components/general"
import { TokenIcon } from "components/token"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { Table } from "components/layout"
import styles from "./AddressTable.module.scss"
import { useTranslation } from "react-i18next"
import WithSearchInput from "pages/custom/WithSearchInput"
import AddressBox from "components/form/AddressBox"

interface Props {
  finderLink?: boolean // either display finder link if true or AddressBox comp
  className?: string
}

const AddressTable = (props: Props) => {
  const { finderLink, className } = props
  const addresses = useInterchainAddresses() as { [key: string]: AccAddress }
  const networks = useNetwork()
  const { t } = useTranslation()

  if (!addresses)
    return (
      <p className={styles.connect}>
        {t("Connect a wallet to see your addresses")}
      </p>
    )

  const addressData = Object.keys(addresses).map((key) => ({
    address: addresses?.[key],
    chainName: getChainNamefromID(key, networks) ?? key,
    id: key,
  }))

  return (
    <WithSearchInput gap={10} placeholder={t("Search for a chain...")}>
      {(keyword: string) => (
        <Table
          className={className}
          size="small"
          bordered
          dataSource={addressData}
          filter={({ chainName }) => {
            if (!keyword) return true
            if (chainName.toLowerCase().includes(keyword.toLowerCase()))
              return true
            return false
          }}
          columns={[
            {
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
              dataIndex: "address",
              hidden: !finderLink,
              render: (address: AccAddress) => (
                <div className={styles.address}>
                  <FinderLink value={address}>{truncate(address)}</FinderLink>
                  <CopyIcon text={address} />
                </div>
              ),
            },
            {
              hidden: finderLink,
              dataIndex: "address",
              render: (address: AccAddress) => <AddressBox address={address} />,
            },
          ]}
        />
      )}
    </WithSearchInput>
  )
}

export default AddressTable
