import { URL } from 'cypress/constants';
import { SETUP_STUDY_SESSION_OPTIONS } from '~/constants';

describe('setupStudySession', () => {
  it('can see options and select through dropdown', () => {
    cy.visit(`${URL}/study`);

    cy.get('.mantine-Select-root').click();
    SETUP_STUDY_SESSION_OPTIONS.forEach(option => cy.contains('.mantine-Select-option', option));
  });
});