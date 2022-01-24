import { ContractInfo } from "@terra-money/terra.js"
import { FinderLink } from "components/general"
import { Card } from "components/layout"
import ContractItemActions from "./ContractItemActions"
import ContractDetails from "./ContractDetails"
import styles from "./ContractItem.module.scss"

const ContractItem = (props: ContractInfo) => {
  const { address } = props

  return (
    <Card
      title={<FinderLink className={styles.link}>{address}</FinderLink>}
      extra={<ContractItemActions />}
      mainClassName={styles.main}
      bordered
    >
      <ContractDetails {...props} />
    </Card>
  )
}

export default ContractItem
