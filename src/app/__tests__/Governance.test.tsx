import React from "react"
import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { useQuery } from "react-query"
import { RecoilRoot } from "recoil"
import Governance from "pages/gov/Governance"
import { mockProposals } from "../../__mocks__/Proposals.mock"

function renderComponent() {
  return render(
    <MemoryRouter>
      {/* <RecoilRoot> */}
      <Governance />
      {/* </RecoilRoot> */}
    </MemoryRouter>
  )
}

jest.mock("react-query", () => ({
  useQuery: jest.fn().mockReturnValue({
    data: Object,
    isLoading: Boolean,
    error: Object,
  }),
}))

describe("Governance", () => {
  it("matches original component", () => {
    useQuery.mockReturnValue({
      data: mockProposals,
      isLoading: false,
      error: false,
    })
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })
})
