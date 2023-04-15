import React from "react"
import { render, screen } from "@testing-library/react"
import CurrencySetting from "../sections/CurrencySetting"
import { RecoilRoot } from "recoil"
import { NetworksProvider } from "../InitNetworks"
import user from "@testing-library/user-event"
import { mockSupportedFiatList } from "./__mocks__/SupportedFiatList.mock"

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
      <RecoilRoot>
        <CurrencySetting />
      </RecoilRoot>
    </NetworksProvider>
  )
}

jest.mock("../../data/queries/coingecko", () => {
  const useSupportedFiatMock = () => {
    return {
      data: mockSupportedFiatList,
    }
  }

  return {
    useSupportedFiat: useSupportedFiatMock,
  }
})

describe("CurrencySetting", () => {
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
