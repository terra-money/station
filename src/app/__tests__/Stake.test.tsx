import React from "react"
import { render, screen } from "@testing-library/react"
import Stake from "pages/stake/Stake"
import { NetworksProvider } from "app/InitNetworks"
import { RecoilRoot } from "recoil"
import { MemoryRouter } from "react-router-dom"
import { mockNetworks } from "./__mocks__/Networks.mock"
import { mockValidators, mockPriorityVals } from "./__mocks__/Validators.mock"
import { mockDelegations } from "./__mocks__/Delegations.mock"
import { mockCalcDelegations } from "./__mocks__/CalcDelegations.mock"
import { mockUnbondings } from "./__mocks__/Unbondings.mock"
import { mockRewards } from "./__mocks__/Rewards.mock"
import { mockBalances } from "./__mocks__/Balances.mock"
import user from "@testing-library/user-event"
import { mockBankBalance } from "./__mocks__/BankBalance.mock"
import { mockWhitelist } from "./__mocks__/Whitelist.mock"
import { mockExchangeRates } from "./__mocks__/ExchangeRates.mock"
import { mockStakingParams } from "./__mocks__/StakingParams.mock"
import { useQuery } from "react-query"

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
          <Stake />
        </RecoilRoot>
      </MemoryRouter>
    </NetworksProvider>
  )
}

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

  const mockUseChainID = () => {
    return "pisco-1"
  }

  return {
    useAddress: mockUseAddress,
    useNetwork: mockUseNetwork,
    useChainID: mockUseChainID,
    useNetworkName: mockUseNetworkName,
  }
})

jest.mock("../../data/queries/staking", () => {
  const mockUseInterchainDelegations = () => mockDelegations
  const mockUseInterchainValidators = () => mockValidators.data
  const mockUseCalcDelegationsByValidator = () => mockCalcDelegations
  const mockUseStakingParams = () => mockStakingParams
  const mockUseDelegations = () => mockDelegations
  const mockUseUnbondings = () => mockUnbondings
  const mockUseValidators = () => mockValidators
  const mockGetPriorityVals = () => mockPriorityVals
  const mockGetChainUnbondTime = () => 5
  const mockCalcDelegationsTotal = () => 12899999

  return {
    useInterchainDelegations: mockUseInterchainDelegations,
    useInterchainValidators: mockUseInterchainValidators,
    useCalcDelegationsByValidator: mockUseCalcDelegationsByValidator,
    useStakingParams: mockUseStakingParams,
    useDelegations: mockUseDelegations,
    useUnbondings: mockUseUnbondings,
    useValidators: mockUseValidators,
    getPriorityVals: mockGetPriorityVals,
    getChainUnbondTime: mockGetChainUnbondTime,
    calcDelegationsTotal: mockCalcDelegationsTotal,
  }
})

jest.mock("../../data/queries/distribution", () => {
  const mockUseRewards = () => {
    return mockRewards
  }

  return {
    useRewards: mockUseRewards,
  }
})

jest.mock("../../data/settings/Theme", () => {
  const mockUseThemeFavicon = () => "/static/media/favicon.1e08d51d.svg"

  return {
    useThemeFavicon: mockUseThemeFavicon,
  }
})

jest.mock("../../data/queries/bank", () => {
  const mockUseIsWalletEmpty = () => {
    return false
  }

  const mockUseBankBalance = () => {
    return mockBankBalance
  }

  const mockUseBalances = () => {
    return mockBalances
  }

  return {
    useIsWalletEmpty: mockUseIsWalletEmpty,
    useBankBalance: mockUseBankBalance,
    useBalances: mockUseBalances,
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

jest.mock("../../data/queries/coingecko", () => {
  const mockUseExchangeRates = () => {
    return mockExchangeRates
  }

  return {
    useExchangeRates: mockUseExchangeRates,
  }
})

jest.mock("@terra-money/terra-utils", () => {
  const actual = jest.requireActual("@terra-money/terra-utils")
  const mockTruncate = (value: string) => value

  return {
    ...actual,
    truncate: mockTruncate,
  }
})

jest.mock("react-query", () => ({
  useQuery: jest.fn().mockReturnValue({
    data: Object,
    isLoading: Boolean,
    error: Object,
  }),
}))

describe("Stake", async () => {
  beforeEach(() => {
    useQuery.mockReturnValue({
      data: 420829,
      isLoading: false,
      error: null,
    })
  })

  it("matches original component", () => {
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })

  it("matches undelegate page", async () => {
    const { asFragment } = renderComponent()

    const undelegateButton = screen.getByRole("button", {
      name: /Undelegate/i,
    })
    await user.click(undelegateButton)

    expect(asFragment()).toMatchSnapshot()
  })

  it("matches manual staking page", async () => {
    const { asFragment } = renderComponent()

    const manualStakingButton = screen.getByRole("button", {
      name: /Manual Stake/i,
    })
    await user.click(manualStakingButton)

    expect(asFragment()).toMatchSnapshot()
  })

  it("matches manual staking page with search", async () => {
    const { asFragment } = renderComponent()

    const manualStakingButton = screen.getByRole("button", {
      name: /Manual Stake/i,
    })
    await user.click(manualStakingButton)

    const searchBar = screen.getByRole("textbox")
    await user.click(searchBar)
    await user.keyboard("Terran")

    expect(asFragment()).toMatchSnapshot()
  })
})
