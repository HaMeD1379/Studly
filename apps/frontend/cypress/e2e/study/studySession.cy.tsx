import { URL } from 'cypress/constants';

describe('study session timer', () => {
  it('can click start and see countdown', () => {
    cy.visit(`${URL}/study`);

    cy.get('[data-disabled="true"]').should('exist').should('contain.text', 'Stop');
    cy.get('.__m__-_r_14_ > .mantine-active').should('contain.text', 'Start').click();
    cy.get('[data-disabled="true"]').should('exist').should('contain.text', 'Start');
  });
});