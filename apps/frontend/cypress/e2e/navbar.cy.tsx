import { URL } from '../constants';

describe('navbar', () => {
  it('loads and renders correctly on page to routes', () => {
    cy.visit(`${URL}/home`);

    cy.get('[data-variant="transparent"]').click();
    cy.url().should('include', 'study');
    cy.get('[data-variant="transparent"]').click();
    cy.url().should('include', 'home');
  });
});