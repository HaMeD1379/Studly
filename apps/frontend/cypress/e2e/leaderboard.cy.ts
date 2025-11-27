describe('leaderboard', () => {
  beforeEach(() => {
    cy.login();
    cy.contains('button', 'Leaderboard').click();
  });

  it('should display yourself on friends only', () => {
    cy.contains('button', 'Friends Only').click();
    cy.contains('You');
    cy.contains('2h 1m');
    cy.contains('#1');

    cy.contains('label', 'Badges').eq(0).click();
    cy.contains('You');
    cy.contains('5 badges');
    cy.contains('#1');
  });
});
