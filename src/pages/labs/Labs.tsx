import { Page, Tabs } from "components/layout"
import Pairs from "./Pairs"

const Labs = () => {
  return (
    <Page title="Labs">
      <Tabs
        tabs={[{ key: "pairs", tab: "Pairs", children: <Pairs /> }]}
        type="card"
      />
    </Page>
  )
}

export default Labs
