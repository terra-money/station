import { useTranslation } from "react-i18next"
import { getAmount } from "utils/coin"
import { useDeposits } from "data/queries/gov"
import { FinderLink } from "components/general"
import { Card, Table } from "components/layout"
import { Read } from "components/token"
import { useChains } from "data/queries/chains"

// FIXME: Pagination (Client)

const ProposalDepositors = ({ id, chain }: { id: number; chain: string }) => {
  const { t } = useTranslation()
  const chains = useChains()
  const { data: deposits, ...state } = useDeposits(id, chain)

  return (
    <Card {...state} title={t("Depositors")} bordered>
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
                  amount={getAmount(amount, chains[chain].baseAsset)}
                  denom={chains[chain].baseAsset}
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
