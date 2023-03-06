import React from "react"
import Links from "./Links"
import { RecoilRoot } from "recoil"
import { NetworksProvider } from "../InitNetworks"
import renderer from "react-test-renderer"

jest.mock("../../data/wallet", () => {
  const useAddress = () => {
    return "terra111111111111111111111111111111111111111"
  }

  return {
    useAddress: useAddress,
  }
})

it("Links match snapshot", () => {
  type TokenFilter = <T>(network: Record<string, T>) => Record<string, T>
  const networks = {} as jest.Mocked<InterchainNetworks>
  const mockedTokenFilter = {} as jest.Mocked<TokenFilter>

  const tree = renderer
    .create(
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
    .toJSON()
  expect(tree).toMatchSnapshot()
})
