describe('home', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should display home page statistics', () => {
    cy.contains('Welcome back, E2E Tester!');
    cy.contains('Five Hour Champion');
    cy.contains('Study for a total of 5 hours');
    cy.get('[role="progressbar"]').should(
      'have.attr',
      'aria-valuenow',
      '40.33333333333333',
    );

    cy.contains('0m today');
    cy.contains('0 day streak');
    cy.contains('5 badges');
    cy.contains('button', 'View More');
    cy.contains('0m');
  });
});
