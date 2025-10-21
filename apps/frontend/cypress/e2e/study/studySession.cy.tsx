import { URL } from 'cypress/constants';

describe('study session timer', () => {
  it('can click start and see countdown', () => {
    cy.visit(`${URL}/study`);

    cy.get('[data-disabled="true"]').should('exist').should('contain.text', 'Stop');
    cy.contains('button', 'Start').click();
    cy.get('[data-disabled="true"]').should('exist').should('contain.text', 'Start');
  });
});