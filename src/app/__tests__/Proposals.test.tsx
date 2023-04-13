import React from "react"
import Proposals from "pages/gov/Proposals"
import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { mockProposals } from "./__mocks__/Proposals.mock"
import { mockNetworks } from "./__mocks__/Networks.mock"
import { useQuery } from "react-query"
import { RecoilRoot } from "recoil"

function renderComponent() {
  return render(
    <MemoryRouter>
      <RecoilRoot>
        <Proposals />
      </RecoilRoot>
    </MemoryRouter>
  )
}

jest.mock("../../data/wallet", () => {
  const mockUseNetwork = () => {
    return mockNetworks
  }

  return {
    useNetwork: mockUseNetwork,
  }
})

jest.mock("react-query", () => ({
  useQuery: jest.fn().mockReturnValue({
    data: Object,
    isLoading: Boolean,
    error: Object,
  }),
}))

describe("Proposals component matches snapshots", () => {
  it("matches original component", () => {
    useQuery.mockReturnValue({
      data: mockProposals,
      isLoading: false,
      error: {},
    })
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })
})
