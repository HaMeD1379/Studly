import { URL } from '../constants';

describe('navbar', () => {
  it('loads and renders correctly on page to routes', () => {
    cy.visit(`${URL}/home`);

    cy.get('[data-variant="transparent"]').eq(0).click();
    cy.url().should('include', 'study');
    cy.get('[data-variant="transparent"]').eq(0).click();
    cy.url().should('include', 'home');
    cy.get('[data-variant="transparent"]').eq(1).click();
    cy.url().should('include', 'badges');
  });
});