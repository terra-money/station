import { ConditionalRender } from 'components/ConditionalRender'
import { Card, ChainFilter } from 'components/layout'
import { useSwapChains } from './SwapChainsContext'
import TFMSwapContext from './TFMSwapContext'
import TFMSwapForm from './TFMSwapForm'

export const SwapPageContent = () => {
  const { swapProvider } = useSwapChains()

  return (
    <Card>
      <ChainFilter
        outside
        title={'Select a chain to perform swaps on'}
        limitTo={Object.keys(swapProvider)}
      >
        {(chainID) =>
          chainID && (
            <ConditionalRender
              value={swapProvider[chainID]}
              tfm={() => (
                <TFMSwapContext>
                  <TFMSwapForm chainID={chainID ?? ''} />
                </TFMSwapContext>
              )}
              rango={() => <p>Coming soon!</p>}
            />
          )
        }
      </ChainFilter>
    </Card>
  )
}
