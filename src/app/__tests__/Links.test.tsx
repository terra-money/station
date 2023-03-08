import React from "react"
import Links from "../sections/Links"
import { RecoilRoot } from "recoil"
import { NetworksProvider } from "../InitNetworks"
import { render } from "@testing-library/react"

function renderComponent() {
  type TokenFilter = <T>(network: Record<string, T>) => Record<string, T>
  const networks = {} as jest.Mocked<InterchainNetworks>
  const mockedTokenFilter = {} as jest.Mocked<TokenFilter>

  return render(
    <NetworksProvider
      value={{
        networks: networks,
        filterEnabledNetworks: mockedTokenFilter,
        filterDisabledNetworks: mockedTokenFilter,
      }}
    >
      <RecoilRoot>
        <Links />
      </RecoilRoot>
    </NetworksProvider>
  )
}

describe("Links component matches snapshots", () => {
  it("matches original component", () => {
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })
})
