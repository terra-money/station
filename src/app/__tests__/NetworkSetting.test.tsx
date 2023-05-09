import React from "react"
import NetworkSetting from "../sections/NetworkSetting"
import { render } from "@testing-library/react"
import { useNetworkState } from "../../auth/hooks/useNetwork"
import { NetworksProvider } from "../InitNetworks"

function renderComponent() {
  type TokenFilter = <T>(network: Record<string, T>) => Record<string, T>
  const networks = {} as jest.Mocked<InterchainNetworks>
  const mockedTokenFilter = jest.fn() as jest.Mocked<TokenFilter>

  return render(
    <NetworksProvider
      value={{
        networksLoading: false,
        networks: networks,
        filterEnabledNetworks: mockedTokenFilter,
        filterDisabledNetworks: mockedTokenFilter,
      }}
    >
      <NetworkSetting />
    </NetworksProvider>
  )
}

describe("NetworkSetting", () => {
  it("matches original component", () => {
    const [_, changeNetwork] = useNetworkState()
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })
})
