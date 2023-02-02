describe('Station', () => {
  it('Home page loads and displays the user\'s LUNA balance', () => {
    cy.visit("/");
    cy.contains("Station");
    cy.get('[data-id="welcome-confirm"]').click();

    cy.contains("0.00 LUNA");
  })
})