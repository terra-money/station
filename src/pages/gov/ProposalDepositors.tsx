import { useTranslation } from "react-i18next"
import { getAmount } from "utils/coin"
import { useDeposits } from "data/queries/gov"
import { FinderLink } from "components/general"
import { Card, Table } from "components/layout"
import { Read } from "components/token"
import { useNetwork } from "data/wallet"

// FIXME: Pagination (Client)

const ProposalDepositors = ({ id, chain }: { id: string; chain: string }) => {
  const { t } = useTranslation()
  const networks = useNetwork()
  const { data: deposits, ...state } = useDeposits(id, chain)

  return (
    <Card {...state} title={t("Depositors")} bordered twoTone>
      {deposits && (
        <Table
          dataSource={deposits}
          pagination={5}
          columns={[
            {
              title: t("Depositor"),
              dataIndex: "depositor",
              render: (address) => <FinderLink short>{address}</FinderLink>,
            },
            {
              title: t("Amount"),
              dataIndex: "amount",
              render: (amount) => (
                <Read
                  amount={getAmount(amount, networks[chain].baseAsset)}
                  denom={networks[chain].baseAsset}
                />
              ),
              align: "right",
            },
          ]}
          size="small"
        />
      )}
    </Card>
  )
}

export default ProposalDepositors
