import React from "react"
import NetworkHeader from "../sections/NetworkHeader"
import { render } from "@testing-library/react"
import { useNetworkName } from "../../data/wallet"

function renderComponent() {
  return render(<NetworkHeader />)
}

jest.mock("../../data/wallet", () => ({
  useNetworkName: jest.fn(),
}))

describe("NetworkHeader", () => {
  it("matches component mainnet", () => {
    useNetworkName.mockReturnValueOnce("mainnet")
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })

  it("matches component testnet", () => {
    useNetworkName.mockReturnValueOnce("testnet")
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })

  it("matches component localterra", () => {
    useNetworkName.mockReturnValueOnce("localterra")
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })

  it("matches component classic", () => {
    useNetworkName.mockReturnValueOnce("classic")
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })
})
