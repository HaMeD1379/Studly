import { URL } from 'cypress/constants';

declare global {
  namespace Cypress {
    interface Chainable {
      login(): Cypress.Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', () => {
  cy.visit(URL);

  cy.get('[name="email"]').type(`${Cypress.env('E2E_TEST_EMAIL')}`);
  cy.get('[name="password"]').type(`${Cypress.env('E2E_TEST_PASS')}`);
  cy.contains('button', 'Sign In').click();
});