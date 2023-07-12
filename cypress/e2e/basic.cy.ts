describe("Station", () => {
  beforeEach(() => {
    cy.visit("/")
    cy.getClass("Wallet_close").first().click()
  })

  it("Wallet is loaded", () => {
    cy.getClass("Wallet_close").first().click()
    cy.contains("Station")
    cy.contains("0.00 LUNA")
    cy.contains("Send")
    cy.contains("Receive")
  })

  it("Wallet should be collapsible", () => {
    cy.getClass("Wallet_wallet__closed").should("exist")
    cy.getClass("Wallet_close").click()
    cy.getClass("Wallet_wallet__closed").should("not.exist")
  })

  it("Swap page loads", () => {
    cy.contains("Send")
    cy.contains("From")
    cy.contains("To")
    cy.contains("Select a coin")
    cy.contains("Slippage tolerance")
  })

  it("History page loads", () => {
    cy.contains("History").click()
    cy.contains("Terra")
    cy.contains("No results found")
  })

  it("Stake page loads", () => {
    cy.contains("Stake").click()
    cy.contains("Quick Stake")
    cy.contains("Terra")
  })

  it("Governance page loads", () => {
    cy.contains("Governance").click()
    cy.contains("New proposal")
    cy.contains("Deposit").click()
    cy.contains("Passed").click()
    cy.contains("Rejected").click()
  })
})
