describe('study session timer', () => {
  beforeEach(() => {
    cy.login();
    cy.contains('button', 'Study Session').click();
  });

  it('both start and stop are disabled buttons on page enter', () => {
    cy.get('[data-disabled="true"]')
      .should('exist')
      .should('contain.text', 'Stop');
    cy.get('[data-disabled="true"]')
      .should('exist')
      .should('contain.text', 'Start');
  });

  it('should be able to setup and then have the buttons be enabled', () => {
    cy.contains('button', '15 minutes').click();
    cy.get('input[placeholder="Select a subject"]').click();
    cy.contains('[role="option"]', 'Mathematics').click();

    cy.get('[data-disabled="true"]')
      .should('exist')
      .should('contain.text', 'Stop');
    cy.contains('button', 'Start').should('not.have.attr', 'data-disabled');
  });

  it('should be able to see recent sessions', () => {
    cy.contains('2025/11/27 - 2:37 PM');
    cy.contains('Chemistry');
    cy.contains('5 minutes');

    cy.contains('2025/11/27 - 2:36 PM');
    cy.contains('Mathematics');
    cy.contains('15 minutes');

    cy.contains('2025/11/27 - 2:35 PM');
    cy.contains('Biology');
    cy.contains('1 hour');
  });
});
