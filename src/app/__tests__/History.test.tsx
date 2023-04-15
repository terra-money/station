import React from "react"
import History from "../../pages/history/History"
import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { RecoilRoot } from "recoil"
import { NetworksProvider } from "../InitNetworks"
import { useQuery } from "react-query"
import { mockHistory } from "./__mocks__/History.mock"
import { mockNetworks } from "./__mocks__/Networks.mock"
import { mockWhitelist } from "./__mocks__/Whitelist.mock"
import { mockInterchainAddresses } from "./__mocks__/InterchainAddresses.mock"
import { mockBankBalance } from "./__mocks__/BankBalance.mock"

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
      <MemoryRouter>
        <RecoilRoot>
          <History />
        </RecoilRoot>
      </MemoryRouter>
    </NetworksProvider>
  )
}

jest.mock("../../auth/hooks/useAddress", () => {
  const useInterchainAddresses = () => {
    return mockInterchainAddresses
  }

  return {
    useInterchainAddresses: useInterchainAddresses,
  }
})

jest.mock("../../data/wallet", () => {
  const mockUseAddress = () => {
    return "terra111111111111111111111111111111111111111"
  }

  const mockUseNetwork = () => {
    return mockNetworks
  }

  const mockUseNetworkName = () => {
    return "testnet"
  }

  return {
    useAddress: mockUseAddress,
    useNetwork: mockUseNetwork,
    useNetworkName: mockUseNetworkName,
  }
})

jest.mock("../../data/queries/chains", () => {
  const actual = jest.requireActual("../../data/queries/chains")

  const mockUseWhitelist = () => {
    return mockWhitelist
  }

  return {
    ...actual,
    useWhitelist: mockUseWhitelist,
  }
})

jest.mock("../../data/queries/bank", () => {
  const mockUseBankBalance = () => {
    return mockBankBalance.data
  }

  return {
    useBankBalance: mockUseBankBalance,
  }
})

jest.mock("react-query", () => ({
  useQuery: jest.fn().mockReturnValue({
    data: Object,
    isLoading: Boolean,
    error: Object,
  }),
}))

jest.mock("../../utils/chain", () => {
  const mockUseSortedDisplayChains = () => ["pisco-1"]

  return {
    useSortedDisplayChains: mockUseSortedDisplayChains,
  }
})

describe("History", () => {
  it("matches original component", () => {
    useQuery.mockReturnValue({
      data: mockHistory,
      isLoading: false,
      error: {},
    })
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })
})
