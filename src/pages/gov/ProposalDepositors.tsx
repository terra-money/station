import { useTranslation } from "react-i18next"
import { getAmount } from "utils/coin"
import { useDeposits } from "data/queries/gov"
import { FinderLink } from "components/general"
import { Card, Table } from "components/layout"
import { Read } from "components/token"

// FIXME: Pagination (Client)

const ProposalDepositors = ({ id }: { id: number }) => {
  const { t } = useTranslation()
  const { data: deposits, ...state } = useDeposits(id)

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
                <Read amount={getAmount(amount, "uluna")} denom="uluna" />
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
