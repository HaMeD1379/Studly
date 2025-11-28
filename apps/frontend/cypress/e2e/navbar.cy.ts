describe('navbar', () => {
  beforeEach(() => {
    cy.login();
    cy.contains('button', 'Home').click();
  });

  it('loads and renders correctly on page to routes', () => {
    cy.url().should('include', 'home');

    cy.get('[data-variant="transparent"]').eq(0).click();
    cy.url().should('include', 'study');
    cy.get('[data-variant="transparent"]').eq(1).click();
    cy.url().should('include', 'badges');
    cy.get('[data-variant="transparent"]').eq(2).click();
    cy.url().should('include', 'leaderboard');
    cy.get('[data-variant="transparent"]').eq(3).click();
    cy.url().should('include', 'profile');
    cy.get('[data-variant="transparent"]').eq(4).click();
    cy.url().should('include', 'settings');
  });
});
