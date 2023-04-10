import { render, screen, waitFor } from "@testing-library/react"
import React, { useState as useStateMock } from "react"
import Contract from "pages/contract/Contract"
import { mount, shallow } from "enzyme"
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

jest.mock("react-query", () => ({
  useQuery: jest.fn().mockReturnValue({
    data: Object,
    isLoading: Boolean,
    error: Object,
  }),
}))

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    pathname: "/contract",
    search: "",
    state: null,
    hash: "",
    key: "pbbp8kkj",
  }),
}))

jest.mock("../../data/queries/wasm", () => {
  const mockUseContractInfo = (address: any) => {
    return mockContract
  }

  return {
    useContractInfo: mockUseContractInfo,
  }
})

// describe('Contract component matches snapshots', () => {
//   it('matches original component', () => {
//     useQuery.mockReturnValue({
//       data: mockContract,
//       isLoading: false,
//       error: {},
//     });
//     const { asFragment } = renderComponent();
//     expect(asFragment()).toMatchSnapshot();
//   });

//   it('does not find contract', async () => {
//     useQuery.mockReturnValue({
//       data: mockContract,
//       isLoading: false,
//       error: {},
//     });
//     const { asFragment } = renderComponent();

//     // Search for contract.
//     const contractSearch = screen.getByRole('textbox');
//     await userEvent.type(contractSearch, 'terra');

//     // Ensure snapshot matches user augmented component.
//     expect(asFragment()).toMatchSnapshot();
//   });
// });

describe("Find contract with address", () => {
  it("finds contract", async () => {
    useQuery.mockReturnValue({
      result: mockContract,
      isLoading: false,
      error: false,
    })
    const { asFragment } = renderComponent()

    // Search for contract.
    const contractSearch = screen.getByRole("textbox")
    await userEvent.type(
      contractSearch,
      "terra18qr46nvqnymd4wl4md58kgdz699xcwcf6h7dd0"
    )

    // Ensure snapshot matches user augmented component.
    expect(asFragment()).toMatchSnapshot()
  })
})
