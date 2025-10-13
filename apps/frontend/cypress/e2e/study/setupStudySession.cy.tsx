import { URL } from 'cypress/constants';
import { setupStudySessionOptions } from '~/constants';

describe('setupStudySession', () => {
  it('can see options and select through dropdown', () => {
    cy.visit(`${URL}/study`);

    cy.get('.mantine-Select-root').click();
    setupStudySessionOptions.forEach(option => cy.contains('.mantine-Select-option', option));
  });
});