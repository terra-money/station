import React from "react"
import SelectTheme from "../sections/SelectTheme"
import { RecoilRoot } from "recoil"
import { NetworksProvider } from "../InitNetworks"
import { render } from "@testing-library/react"
import { mockNetworks } from "./__mocks__/Networks.mock"

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
        <SelectTheme />
      </RecoilRoot>
    </NetworksProvider>
  )
}

jest.mock("../../data/wallet", () => {
  const mockUseNetworkName = () => {
    return "testnet"
  }

  const mockUseAddress = () => {
    return "terra111111111111111111111111111111111111111"
  }

  const mockUseChainID = () => {
    return "pisco-1"
  }

  const mockUseNetwork = () => {
    return mockNetworks
  }

  const mockUseDelegations = () => {
    return []
  }

  return {
    useNetworkName: mockUseNetworkName,
    useAddress: mockUseAddress,
    useChainID: mockUseChainID,
    useNetwork: mockUseNetwork,
    useDelegations: mockUseDelegations,
  }
})

jest.mock("../../data/settings/Theme", () => {
  const mockUseValidateTheme = () => {}

  return {
    useValidateTheme: mockUseValidateTheme,
  }
})

const mockSetTheme = jest.fn()

jest.mock("../../data/settings/Theme", () => {
  const mockUseThemeState = () => ["dark", mockSetTheme]
  const mockUseValidateTheme = () => {}

  return {
    useThemeState: mockUseThemeState,
    useValidateTheme: mockUseValidateTheme,
  }
})

describe("SelectTheme component matches snapshots", () => {
  it("matches original component", () => {
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })
})
