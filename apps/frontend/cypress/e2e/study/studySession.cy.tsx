describe('study session timer', () => {
  beforeEach(() => {
    cy.login();
  })

  it('both start and stop are disabled buttons on page enter', () => {
    cy.contains('button', 'Study Session').click();

    cy.get('[data-disabled="true"]')
      .should('exist')
      .should('contain.text', 'Stop');
      cy.get('[data-disabled="true"]')
      .should('exist')
      .should('contain.text', 'Start');
  });
});
