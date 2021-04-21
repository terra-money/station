import { useCW20Pairs } from "data/Terra/TerraAssets"
import { WithTokenItem } from "data/token"
import { Col, Row, Card } from "components/layout"
import { Token } from "components/token"

const Pairs = () => {
  const { data: cw20Pairs = {} } = useCW20Pairs()

  return (
    <Col>
      {Object.entries(cw20Pairs).map(([pair, tokens]) => (
        <Card title={pair} size="small" key={pair}>
          <Row>
            {tokens.map((token) => (
              <WithTokenItem token={token} key={token}>
                {(item) => (
                  <Col>
                    <Token {...item} description={token} />
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
