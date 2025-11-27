describe('badges', () => {
  beforeEach(() => {
    cy.login();
    cy.contains('button', 'Badges').click();
  });

  it('should display badges statistics and badge data', () => {
    cy.contains('5');
    cy.contains('15');
    cy.contains('33%');
  
    cy.contains('5 of 15 badges unlocked');
    cy.get('[role="progressbar"]').should('have.attr', 'aria-valuenow', '33');
  
    cy.contains('Getting Started');
    cy.contains('Complete 5 study sessions');
    cy.contains('Unlocked 2025-11-27');

    cy.contains('First Steps');
    cy.contains('Complete your first study session');

    cy.contains('All Badges').click();

    // we want to make sure the unlocked badges are still there
    cy.contains('Getting Started');
    cy.contains('Complete 5 study sessions');
    cy.contains('Unlocked 2025-11-27');

    cy.contains('Dedicated Student');
    cy.contains('Complete 10 study sessions');
    cy.contains('Locked');
  });
});