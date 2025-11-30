describe('friends', () => {
  beforeEach(() => {
    cy.login();
    cy.contains('button', 'Friends').click();
  });

  it('can search for friends', () => {
    cy.get("[name='searchUser'").type('Test');
    cy.contains('Test User');
  });
});