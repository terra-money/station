import React from "react"
import { render, screen } from "@testing-library/react"
import Stake from "pages/stake/Stake"
import { NetworksProvider } from "app/InitNetworks"
import { RecoilRoot } from "recoil"
import { MemoryRouter } from "react-router-dom"
import { mockNetworks } from "./__mocks__/Networks.mock"
import { mockValidators } from "./__mocks__/Validators.mock"
import { mockDelegations } from "./__mocks__/Delegations.mock"
import { mockCalcDelegations } from "./__mocks__/CalcDelegations.mock"
import { mockUnbondings } from "./__mocks__/Unbondings.mock"
import { mockRewards } from "./__mocks__/Rewards.mock"
import { mockBalances } from "./__mocks__/Balances.mock"
import user from "@testing-library/user-event"

function renderComponent() {
  type TokenFilter = <T>(network: Record<string, T>) => Record<string, T>
  const networks = {} as jest.Mocked<InterchainNetworks>
  const mockedTokenFilter = () => true as jest.Mocked<TokenFilter>

  return render(
    <NetworksProvider
      value={{
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
  const mockUseNetwork = () => {
    return mockNetworks
  }

  const mockUseChainID = () => {
    return "pisco-1"
  }

  return {
    useNetwork: mockUseNetwork,
    useChainID: mockUseChainID,
  }
})

jest.mock("@terra-money/wallet-provider", () => {
  const actual = jest.requireActual("@terra-money/wallet-provider")

  const useWallet = () => {
    return {
      status: "WALLET_CONNECTED",
      network: ["pisco-1"],
    }
  }

  return {
    ...actual,
    useWallet: useWallet,
  }
})

jest.mock("../../data/queries/staking", () => {
  const mockUseInterchainDelegations = () => mockDelegations
  const mockUseInterchainValidators = () => mockValidators
  const mockUseCalcDelegationsByValidator = () => mockCalcDelegations
  const mockUseDelegations = () => mockDelegations
  const mockUseUnbondings = () => mockUnbondings
  const mockUseValidators = () => mockValidators

  return {
    useInterchainDelegations: mockUseInterchainDelegations,
    useInterchainValidators: mockUseInterchainValidators,
    useCalcDelegationsByValidator: mockUseCalcDelegationsByValidator,
    useDelegations: mockUseDelegations,
    useUnbondings: mockUseUnbondings,
    useValidators: mockUseValidators,
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

jest.mock("../../data/queries/bank", () => {
  const mockUseBalances = () => {
    return mockBalances
  }

  return {
    useBalances: mockUseBalances,
  }
})

describe("Stake page component matches snapshots", async () => {
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
