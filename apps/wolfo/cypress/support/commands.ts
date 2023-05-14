/// <reference types="cypress" />
// ***********************************************
// eslint-disable-next-line prettier/prettier
export { };

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to intercept GET endpoint for users
       * @example cy.getUsers()
       */
      getUsers(): Chainable<void>;
      /**
       * Custom command to intercept GET endpoint for current user
       * @example cy.getMe()
       */
      getMe(): Chainable<void>;
      /**
       * Custom command to intercept POST endpoint for users
       * @example cy.createUser()
       */
      createUser(): Chainable<void>;
      /**
       * Custom command to intercept DELETE endpoint for user
       * @example cy.deleteUser()
       */
      deleteUser(): Chainable<void>;
      /**
       * Custom command to intercept UPDATE endpoint for users
       * @example cy.updateUser()
       */
      updateUser(): Chainable<void>;
      /**
       * Custom command to intercept POST endpoint for user
       * @example cy.login()
       */
      login(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("getUsers", () => {
  cy.intercept("GET", "http://localhost:3000/api/users").as("getUsers");
});

Cypress.Commands.add("getMe", () => {
  cy.intercept("GET", "http://localhost:3000/api/users/me").as("getMe");
});

Cypress.Commands.add("createUser", () => {
  cy.intercept("POST", "http://localhost:3000/api/users").as("createUser");
});

Cypress.Commands.add("deleteUser", () => {
  cy.intercept("DELETE", "http://localhost:3000/api/users").as("deleteUser");
});

Cypress.Commands.add("updateUser", () => {
  cy.intercept("PATCH", "http://localhost:3000/api/users").as("updateUser");
});

Cypress.Commands.add("login", () => {
  cy.intercept("POST", "http://localhost:3000/api/users/login").as("login");
});
