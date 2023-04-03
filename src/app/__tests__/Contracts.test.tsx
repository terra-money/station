import { render } from "@testing-library/react"
import Contract from "pages/contract/Contract"
import { useQuery } from "react-query"
import { MemoryRouter } from "react-router-dom"
import { mockContract } from "./__mocks__/Contract.mock"
import { mockNetworks } from "./__mocks__/Networks.mock"

function renderComponent() {
  return render(
    <MemoryRouter>
      <Contract />
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

describe("Contract component matches snapshots", () => {
  it("matches original component", () => {
    useQuery.mockReturnValue({
      data: mockContract,
      isLoading: false,
      error: {},
    })
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })
})
