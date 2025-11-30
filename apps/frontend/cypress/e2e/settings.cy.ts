describe('settings', () => {
  beforeEach(() => {
    cy.login();
    cy.contains('button', 'Settings').click();
  });

  it('shows account information', () => {
    cy.get('[data-testid="name-text-update"]').should(
      'have.value',
      'E2E Tester',
    );
    cy.get('[data-testid="email-text-update"]').should(
      'have.value',
      'e2e@test.com',
    );
  });
});
