describe('profile', () => {
  beforeEach(() => {
    cy.login();
    cy.contains('button', 'Profile').click();
  });

  it('can see your own profile', () => {
    cy.contains('E2E Tester');
    cy.contains('e2e@test.com');
    cy.contains('Edit profile to update your bio');

    cy.contains('2 hours 25 minutes');
    cy.contains('5');

    cy.contains('10m');
    cy.contains('33m');
    cy.contains('60m');
    cy.contains('16m');
    cy.contains('2m');
  });
});
