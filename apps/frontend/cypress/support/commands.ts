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

  cy.get('[name="email"]').type(`${Cypress.env('email')}`);
  cy.get('[name="password"]').type(`${Cypress.env('password')}`);
  cy.contains('button', 'Sign In').click();
});
