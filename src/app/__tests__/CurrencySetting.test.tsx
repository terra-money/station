import React from "react"
import { render, screen } from "@testing-library/react"
import CurrencySetting from "../sections/CurrencySetting"
import { RecoilRoot } from "recoil"
import { NetworksProvider } from "../InitNetworks"
import user from "@testing-library/user-event"

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
        <CurrencySetting />
      </RecoilRoot>
    </NetworksProvider>
  )
}

jest.mock("../../data/queries/coingecko", () => {
  // Replace functionality of useSupportedFiat.
  const useSupportedFiatMock = () => {
    return {
      data: mockSupportedFiatList,
    }
  }

  return {
    useSupportedFiat: useSupportedFiatMock,
  }
})

// Mocked supported fiats list.
const mockSupportedFiatList = [
  {
    id: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
  },
  {
    id: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
  },
  {
    id: "USD",
    name: "United States Dollar",
    symbol: "$",
  },
]

describe("CurrencySetting component matches snapshots", () => {
  it("matches original component", () => {
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })

  it("matches user augmented component", async () => {
    const { asFragment } = renderComponent()

    // Search for JPY currency in search bar.
    const searchBar = screen.getByRole("textbox")
    await user.click(searchBar)
    await user.keyboard("JPY")

    // Ensure only JPY button shows and click to change currency.
    const jpyButton = screen.getByRole("button")
    await user.click(jpyButton)

    // Ensure snapshot matches user augmented component.
    expect(asFragment()).toMatchSnapshot()
  })
})
