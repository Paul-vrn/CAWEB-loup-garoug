describe("Authentification", () => {
  const newUser = {
    name: "newuser",
    password: "newpass",
  };
  const updateUser = {
    name: "updateuser",
    password: "updatepass",
  };

  beforeEach(() => {
    cy.visit("http://localhost:19000/auth");
  });

  it("should allow new user to register and login", () => {
    cy.getUsers();
    cy.createUser();
    cy.get("@createUser").then(() => {
      cy.get('[data-testid="@name-input/input"]').type(newUser.name);
      cy.get('[data-testid="@password-register-input/input"]').type(newUser.password);
      cy.get('[data-testid="register-button"]').click();
      cy.wait("@createUser");
      cy.url().should("equal", "http://localhost:19000/");
      cy.get('[data-testid="settings-button"]').click();
      cy.url().should("equal", "http://localhost:19000/user");
      cy.get('[data-testid="logout-button"]').click();
      cy.url().should("equal", "http://localhost:19000/auth");
    });
  });

  it("should not allow existing user to register again", () => {
    cy.getUsers();
    cy.createUser();
    cy.get("@createUser").then(() => {
      cy.get('[data-testid="@name-input/input"]').type(newUser.name);
      cy.get('[data-testid="@password-register-input/input"]').type(newUser.password);
      cy.get('[data-testid="register-button"]').click();
      cy.wait("@createUser");
      // cy.contains("Name already exists");
      cy.url().should("equal", "http://localhost:19000/auth");
    });
  });

  it("should not allow invalid username to login", () => {
    const invalidUsername = "nonexistentuser";
    cy.getMe();
    cy.login();
    cy.get("@login").then(() => {
      cy.get('[data-testid="@name-input/input"]').type(invalidUsername);
      cy.get('[data-testid="@password-register-input/input"]').type("doesntmatter");
      cy.get('[data-testid="login-button"]').click();
      cy.contains("Name not found");
      cy.url().should("equal", "http://localhost:19000/auth");
    });
  });

  it("should not allow invalid password to login", () => {
    const invalidPassword = "wrongpass";
    cy.getMe();
    cy.login();
    cy.get("@login").then(() => {
      cy.get('[data-testid="@name-input/input"]').type(newUser.name);
      cy.get('[data-testid="@password-register-input/input"]').type(invalidPassword);
      cy.get('[data-testid="login-button"]').click();
      // cy.contains("Wrong password");
      cy.url().should("equal", "http://localhost:19000/auth");
    });
  });

  it("should allow existing user to login", () => {
    cy.getMe();
    cy.login();
    cy.get("@login").then(() => {
      cy.get('[data-testid="@username-input/input"]').type(newUser.name);
      cy.get('[data-testid="@password-login-input/input"]').type(newUser.password);
      cy.get('[data-testid="login-button"]').click();
      cy.url().should("equal", "http://localhost:19000/");
    });
  });

  it("should allow you to log in and modify your account", () => {
    cy.getMe();
    cy.login();
    cy.updateUser();
    cy.get("@login").then(() => {
      cy.get('[data-testid="@username-input/input"]').type(newUser.name);
      cy.get('[data-testid="@password-login-input/input"]').type(newUser.password);
      cy.get('[data-testid="login-button"]').click();
      cy.url().should("equal", "http://localhost:19000/");
      cy.get('[data-testid="settings-button"]').click();
      cy.url().should("equal", "http://localhost:19000/user");
      cy.get('[data-testid="@update-username-input/input"]').type(updateUser.name);
      cy.get('[data-testid="@update-password-input/input"]').type(updateUser.password);
      cy.get('[data-testid="@confirm-update-password-input/input"]').type(updateUser.password);
      cy.get('[data-testid="update-account-button"]').click();
      cy.wait("@updateUser");
      // Additional assertions if needed
    });
  });

  it("should allow you to log in and delete your account", () => {
    cy.getMe();
    cy.login();
    cy.deleteUser();
    cy.get("@login").then(() => {
      cy.get('[data-testid="@username-input/input"]').type(updateUser.name);
      cy.get('[data-testid="@password-login-input/input"]').type(updateUser.password);
      cy.get('[data-testid="login-button"]').click();
      cy.url().should("equal", "http://localhost:19000/");
      cy.get('[data-testid="settings-button"]').click();
      cy.url().should("equal", "http://localhost:19000/user");
      cy.get('[data-testid="delete-account-button"]').click();
      cy.wait("@deleteUser");
      // Additional assertions if needed
    });
  });
});
