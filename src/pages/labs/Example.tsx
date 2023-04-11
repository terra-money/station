import { Page, Tabs } from "components/layout"
import CreateCW3Form from "txs/example/CreateCW3Form"
import Card from "components/layout/Card"

const Example = () => {
  return (
    <Page title="Labs" extra={"Service Integration Tests"}>
      <Tabs
        tabs={[
          {
            key: "pairs",
            tab: "Pairs",
            children: (
              <Card>
                <div>Pairs Tab</div>
              </Card>
            ),
          },
          {
            key: "init",
            tab: "Init CW3",
            children: <CreateCW3Form />,
          },
        ]}
        type="card"
      />
    </Page>
  )
}

export default Example
