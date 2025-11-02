import { URL } from '../constants';

describe('navbar', () => {
  it('loads and renders correctly on page to routes', () => {
    cy.visit(`${URL}/home`);

    cy.contains('button', 'Study Session').click();
    cy.url().should('include', '/study');

    // Go to Home
    cy.contains('button', 'Home').click();
    cy.url().should('include', '/home');

    // Go to Badges
    cy.contains('button', 'Badges').click();
    cy.url().should('include', '/badges');

    // Logout
    cy.contains('button', 'Logout').click();
    cy.url().should('eq', 'http://localhost:5173/logout');
  });
});
