import { ParsedVestingSchedule } from "data/queries/vesting"
import { Table } from "components/layout"
import { Read } from "components/token"

const VestingScheduleTable = ({ type, schedule }: ParsedVestingSchedule) => {
  return (
    <Table
      columns={[
        {
          title: "Period",
          key: "index",
          render: (_, __, index) => index + 1,
          hidden: type !== "Periodic",
        },
        {
          title: "Release date",
          key: "date",
          render: (_, { start, end }) => {
            return [start?.toLocaleDateString(), end.toLocaleDateString()]
              .filter(Boolean)
              .join(" - ")
          },
        },
        {
          title: "Amount",
          dataIndex: "amount",
          render: (value) => <Read amount={value} />,
          align: "right",
        },
      ]}
      dataSource={schedule}
      size="small"
      bordered
    />
  )
}

export default VestingScheduleTable
