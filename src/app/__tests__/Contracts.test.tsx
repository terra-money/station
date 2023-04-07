import { render, screen } from "@testing-library/react"
import Contract from "pages/contract/Contract"
import { useQuery } from "react-query"
import userEvent from "@testing-library/user-event"
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

  it("finds contract", async () => {
    useQuery.mockReturnValue({
      data: mockContract,
      isLoading: false,
      error: {},
    })
    const { asFragment } = renderComponent()

    // Search for contract.
    const contractSearch = screen.getByRole("textbox")
    await userEvent.type(
      contractSearch,
      "terra17ql6m90uasctmmhedn6aasn9my6khhs096sw0g8asrkqv33j2dgqh8ttpt"
    )

    // Ensure snapshot matches user augmented component.
    expect(asFragment()).toMatchSnapshot()
  })

  it("does not find contract", async () => {
    useQuery.mockReturnValue({
      data: mockContract,
      isLoading: false,
      error: {},
    })
    const { asFragment } = renderComponent()

    // Search for contract.
    const contractSearch = screen.getByRole("textbox")
    await userEvent.type(contractSearch, "terra")

    // Ensure snapshot matches user augmented component.
    expect(asFragment()).toMatchSnapshot()
  })
})
