describe("Station", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.getClass('Wallet_close').first().click();
  });

  it("Home page loads and displays the user's LUNA balance", () => {
    cy.contains("Station");
    cy.contains("0.00 LUNA");
  });

  it("Wallet should be collapsible", () => {
    cy.getClass("Wallet_wallet__closed").should("exist");
    cy.getClass('Wallet_close').click();
    cy.getClass("Wallet_wallet__closed").should("not.exist");
  });

  it("Send page loads", () => {
    cy.get(".Wallet_close__1lQWy").click();
    cy.contains("Send").click();
    cy.contains("Asset");
    cy.contains("Source chain");
    cy.contains("Recipient");
    cy.contains("Amount");
    cy.contains("Memo (optional)");
  });

  it("Receive page loads", () => {
    cy.get(".Wallet_close__1lQWy").click();
    cy.contains("Receive").click();
  });

  it("Swap page loads", () => {
    cy.contains("Send");
    cy.contains("From");
    cy.contains("To");
    cy.contains("Select a coin");
    cy.contains("Slippage tolerance");
  });

  it("History page loads", () => {
    cy.contains("History").click();
    cy.contains("Terra");
    cy.contains("No results found");
  });

  it("Stake page loads", () => {
    cy.contains("Stake").click();
    cy.contains("Quick Stake");
    cy.contains("Terra");
    cy.contains("Amount");
    cy.contains("Undelegate").click();
    cy.contains("Terra");
    cy.contains("Amount");
    cy.contains("Manual Stake").click();
    cy.contains("Show inactive validators");
    cy.contains("Moniker");
    cy.contains("Voting power");
    cy.contains("Commission");
  });

  it("Governance page loads", () => {
    cy.contains("Governance").click();
    cy.contains("New proposal");
    cy.contains("Deposit").click();
    cy.contains("Passed").click();
    cy.contains("Rejected").click();
  });

  it("Contract upload page loads", () => {
    cy.contains("Contract").click();
    cy.contains("Upload").click();
    cy.contains("Upload a wasm file");
  });

  it("Contract instantiate page loads", () => {
    cy.contains("Contract").click();
    cy.contains("Instantiate").click();
    cy.contains("Admin");
    cy.contains("Code ID");
    cy.contains("Init");
    cy.contains("Amount");
    cy.contains("Label");
  });
});
