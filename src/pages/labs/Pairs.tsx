import { useCW20Pairs } from "data/Terra/TerraAssets"
import { WithTokenItem } from "data/token"
import { Col, Row, Card } from "components/layout"
import { Token } from "components/token"

const Pairs = () => {
  const { data: pairs } = useCW20Pairs()
  if (!pairs) return null

  return (
    <Col>
      {Object.entries(pairs ?? {}).map(([pair, { dex, type, assets }]) => (
        <Card
          title={pair}
          extra={[dex, type].join(": ")}
          size="small"
          key={pair}
        >
          <Row>
            {assets.map((asset) => (
              <WithTokenItem token={asset} key={asset}>
                {(item) => (
                  <Col>
                    <Token {...item} description={asset} />
                  </Col>
                )}
              </WithTokenItem>
            ))}
          </Row>
        </Card>
      ))}
    </Col>
  )
}

export default Pairs
